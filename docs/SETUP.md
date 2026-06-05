# Cenzo — Setup local y deploy en Railway

---

## Requisitos

| Herramienta | Versión mínima | Instalación |
|-------------|----------------|-------------|
| Node.js | 20 | `nvm install 20` |
| Rust | 1.78 | `rustup update stable` |
| stellar-cli | 21 | ver abajo |
| SQLite | 3 | preinstalado en macOS/Linux |

### Instalar stellar-cli

```bash
cargo install --locked stellar-cli --features opt
```

Verificar:

```bash
stellar --version
# stellar 21.x.x
```

---

## Setup local

### 1. Clonar el repositorio

```bash
git clone https://github.com/estebancanales/cenzo.git
cd cenzo
```

---

### 2. Backend (`apps/api`)

```bash
cd apps/api
cp .env.example .env
```

Editar `apps/api/.env`:

```env
DATABASE_URL=sqlite://censo.db?mode=rwc
CENSO_CONTRACT_ID=<dirección del contrato Soroban en Testnet>
ADMIN_KEY_NAME=dev-key
ADMIN_SECRET_KEY=<clave secreta S... del admin>
STELLAR_NETWORK=testnet
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
API_PORT=4000
API_SHARED_SECRET=
```

**Generar la clave `dev-key` para Testnet:**

```bash
stellar keys generate --global dev-key --network testnet

# Ver la dirección pública generada
stellar keys address dev-key

# Fondear la cuenta en Testnet (gratis)
stellar network fund <DIRECCIÓN> --network testnet
```

**Levantar el backend:**

```bash
cd apps/api
cargo run
```

Las migraciones en `migrations/` se aplican automáticamente al arrancar.  
El servidor queda escuchando en `http://localhost:4000`.

---

### 3. Frontend (`apps/web`)

```bash
cd apps/web
cp .env.example .env.local
```

Editar `apps/web/.env.local`:

```env
CENSO_API_URL=http://127.0.0.1:4000
AUTH_SECRET=<ejecutar: openssl rand -base64 32>
AUTH_GOOGLE_ID=<client id de Google OAuth>
AUTH_GOOGLE_SECRET=<client secret de Google OAuth>
```

**Crear credenciales de Google OAuth:**

1. [console.cloud.google.com](https://console.cloud.google.com) → crear proyecto
2. APIs & Services → Credentials → Create OAuth 2.0 Client ID
3. Application type: **Web application**
4. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copiar Client ID y Client Secret a `.env.local`

**Levantar el frontend:**

```bash
cd apps/web
npm install
npm run dev
```

Frontend disponible en `http://localhost:3000`.

---

### 4. Verificar el setup

Con ambos servidores corriendo:

```bash
# Backend responde
curl http://localhost:4000/actors
# → []

# Frontend carga
open http://localhost:3000
```

**Flujo de prueba rápido:**

```bash
# Registrar un actor
curl -X POST http://localhost:4000/actors \
  -H "Content-Type: application/json" \
  -d '{"kind":"finca","name":"Finca Test","email":"test@finca.cr"}'
# → { "id": 1, "api_key": "xxx..." }

# Crear un lote (usar el api_key recibido)
curl -X POST http://localhost:4000/lotes \
  -H "Content-Type: application/json" \
  -H "x-actor-email: test@finca.cr" \
  -H "x-api-key: xxx..." \
  -d '{"producer":"Finca Test","metadata_uri":"ipfs://test"}'
# → { "id": 1, "mint_tx_hash": "abc..." }
```

---

### 5. Ejecutar tests

```bash
# Tests del contrato Soroban
cd apps/contracts/censo_trace
cargo test

# Tests del frontend
cd apps/web
npx vitest run

# Tests del backend
cd apps/api
cargo test
```

---

## Deploy en Railway

Railway despliega el backend (Rust) y el frontend (Next.js) como dos servicios separados dentro del mismo proyecto. La base de datos SQLite vive como un volumen persistente adjunto al servicio del backend.

### Requisitos previos

- Cuenta en [railway.app](https://railway.app)
- Railway CLI instalado:

```bash
npm install -g @railway/cli
railway login
```

---

### Paso 1 — Crear el proyecto en Railway

```bash
# Desde la raíz del repositorio
railway init
# Nombre sugerido: cenzo
```

O hacerlo desde el dashboard web en [railway.app/new](https://railway.app/new).

---

### Paso 2 — Desplegar el backend (Rust)

#### 2a. Crear el servicio del backend

Desde el dashboard de Railway:

1. **New Service** → **GitHub Repo** → seleccionar `estebancanales/cenzo`
2. Nombre del servicio: `api`
3. En **Settings → Build**:
   - Root Directory: `apps/api`
   - Build Command: `cargo build --release`
   - Start Command: `./target/release/api`

O si preferís con CLI:

```bash
railway service create --name api
```

#### 2b. Crear el volumen para SQLite

Railway necesita un volumen persistente para que la base de datos sobreviva entre deploys:

1. En el servicio `api` → **Volumes** → **Add Volume**
2. Mount path: `/data`
3. Tamaño: 1 GB (suficiente para empezar)

Luego actualizar `DATABASE_URL` para usar ese path:

```env
DATABASE_URL=sqlite:///data/censo.db
```

#### 2c. Variables de entorno del backend

En Railway → servicio `api` → **Variables**, agregar:

```env
DATABASE_URL=sqlite:///data/censo.db?mode=rwc
CENSO_CONTRACT_ID=<dirección del contrato en Stellar Testnet>
ADMIN_KEY_NAME=censo-admin
ADMIN_SECRET_KEY=<clave secreta S... del admin — marcar como Secret en Railway>
STELLAR_NETWORK=testnet
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
API_PORT=8080
API_SHARED_SECRET=<openssl rand -hex 32>
STELLAR_BIN=/usr/local/bin/stellar
```

> `ADMIN_SECRET_KEY` se usa directamente como `--source` en las llamadas al CLI — no se necesita configurar un keystore en el contenedor.

#### 2d. El Dockerfile ya está incluido

El repositorio incluye `apps/api/Dockerfile` con un build de 3 etapas:

1. **Stage 1** — compila `stellar-cli` (cacheado independientemente)
2. **Stage 2** — compila `censo-api` con cache de dependencias
3. **Stage 3** — imagen runtime mínima (`debian:bookworm-slim`) con los dos binarios

Railway detecta el `Dockerfile` automáticamente gracias a `apps/api/railway.toml`:

```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 30
```

---

### Paso 3 — Desplegar el frontend (Next.js)

#### 3a. Crear el servicio del frontend

1. En el mismo proyecto de Railway → **New Service** → **GitHub Repo** → `estebancanales/cenzo`
2. Nombre del servicio: `web`
3. En **Settings → Build**:
   - Root Directory: `apps/web`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

#### 3b. Variables de entorno del frontend

Una vez desplegado el backend, copiar la URL pública que Railway asigna al servicio `api` (aparece en Settings → Networking → Public Domain).

En Railway → servicio `web` → **Variables**:

```env
CENSO_API_URL=https://api-<tu-proyecto>.railway.app
AUTH_SECRET=<mismo valor que en local: openssl rand -base64 32>
AUTH_GOOGLE_ID=<client id de Google OAuth>
AUTH_GOOGLE_SECRET=<client secret de Google OAuth>
NEXTAUTH_URL=https://web-<tu-proyecto>.railway.app
```

> `NEXTAUTH_URL` debe coincidir exactamente con el dominio público que Railway asigna al servicio `web`.

#### 3c. Actualizar los Authorized Redirect URIs en Google OAuth

En [console.cloud.google.com](https://console.cloud.google.com):

1. APIs & Services → Credentials → seleccionar tu OAuth client
2. Agregar a **Authorized redirect URIs**:
   ```
   https://web-<tu-proyecto>.railway.app/api/auth/callback/google
   ```

---

### Paso 4 — Deploy

#### Con CLI:

```bash
# Desde la raíz del repo
railway up --service api
railway up --service web
```

#### Desde el dashboard:

Cada push a `main` dispara un deploy automático si configuraste la integración con GitHub (Railway → Settings → Auto Deploy).

---

### Paso 5 — Verificar el deploy

```bash
# Backend vivo
curl https://api-<tu-proyecto>.railway.app/actors
# → []

# Frontend carga
open https://web-<tu-proyecto>.railway.app
```

Ver los logs en tiempo real:

```bash
railway logs --service api
railway logs --service web
```

---

### Resumen de servicios en Railway

| Servicio | Directorio | Puerto | Persistencia |
|----------|-----------|--------|-------------|
| `api` | `apps/api` | 8080 | Volumen `/data` (SQLite) |
| `web` | `apps/web` | 3000 | — (stateless) |

---

## Variables de entorno — referencia completa

### `apps/api` (backend)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Ruta del archivo SQLite | `sqlite:///data/censo.db?mode=rwc` |
| `CENSO_CONTRACT_ID` | Dirección del contrato Soroban en Testnet | `CABCD...` |
| `ADMIN_KEY_NAME` | Alias de la clave en el keystore (solo dev local) | `dev-key` |
| `ADMIN_SECRET_KEY` | Clave secreta S... del admin — marcar como Secret | `SXXX...` |
| `STELLAR_NETWORK` | Red Stellar | `testnet` |
| `SOROBAN_RPC_URL` | RPC del nodo Soroban | `https://soroban-testnet.stellar.org` |
| `STELLAR_NETWORK_PASSPHRASE` | Passphrase de la red | `Test SDF Network ; September 2015` |
| `API_PORT` | Puerto HTTP | `8080` (Railway), `4000` (local) |
| `API_SHARED_SECRET` | Secreto server-a-server para rutas de escritura | `openssl rand -hex 32` |
| `STELLAR_BIN` | Path al binario stellar-cli | `/usr/local/bin/stellar` |

### `apps/web` (frontend)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `CENSO_API_URL` | URL del backend | `https://api-xxx.railway.app` |
| `AUTH_SECRET` | Secret para firmar JWTs de Auth.js y wallet | resultado de `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | Client ID de Google OAuth | `xxx.apps.googleusercontent.com` |
| `AUTH_GOOGLE_SECRET` | Client Secret de Google OAuth | `GOCSPX-xxx` |
| `NEXTAUTH_URL` | URL pública del frontend (solo producción) | `https://web-xxx.railway.app` |

---

## Contrato Soroban — redeploy opcional

El contrato ya está desplegado en Testnet. Solo es necesario redesplegar si cambiás `apps/contracts/censo_trace/src/`.

```bash
cd apps/contracts/censo_trace

# Compilar a WASM
cargo build --target wasm32-unknown-unknown --release

# Desplegar en Testnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/censo_trace.wasm \
  --source dev-key \
  --network testnet
# → CONTRACT_ID: CXXXXXXX...

# Inicializar el contrato con la dirección del admin
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source dev-key \
  --network testnet \
  -- initialize \
  --admin <DIRECCIÓN_PÚBLICA_DEL_ADMIN>

# Actualizar CENSO_CONTRACT_ID en apps/api/.env (local) y en Railway (producción)
```

Ver el contrato en el explorador de Stellar:

```
https://stellar.expert/explorer/testnet/contract/<CONTRACT_ID>
```
