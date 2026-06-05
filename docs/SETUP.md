# Cenzo — Setup local

Guía paso a paso para levantar el proyecto completo en desarrollo.

## Requisitos

| Herramienta | Versión mínima | Notas |
|-------------|----------------|-------|
| Node.js | 20 | Usar nvm si hay conflictos de versión |
| Rust | 1.78 | `rustup update stable` |
| Cargo | (incluido con Rust) | |
| stellar-cli | 21+ | Ver instalación abajo |
| SQLite | 3 | Generalmente ya instalado en macOS/Linux |

### Instalar stellar-cli

```bash
cargo install --locked stellar-cli --features opt
```

---

## 1. Clonar el repositorio

```bash
git clone https://github.com/estebancanales/cenzo.git
cd cenzo
```

---

## 2. Configurar el backend (`apps/api`)

```bash
cd apps/api
cp .env.example .env
```

Editar `.env`:

```env
DATABASE_URL=sqlite://censo.db
CONTRACT_ID=<dirección del contrato Soroban>
KEY_NAME=<nombre de la clave en stellar-cli>
NETWORK=testnet
ADMIN_SECRET_KEY=<clave secreta del admin>
API_PORT=4000
```

### Generar una clave Stellar para desarrollo

```bash
stellar keys generate --global dev-key --network testnet
stellar keys address dev-key
```

Usar el nombre `dev-key` como `KEY_NAME` en `.env`.

### Ejecutar migraciones y levantar el servidor

```bash
cargo run
```

El backend corre en `http://localhost:4000`.

Las migraciones en `migrations/` se aplican automáticamente al arrancar (SQLx).

---

## 3. Configurar el frontend (`apps/web`)

```bash
cd apps/web
cp .env.example .env.local
```

Editar `.env.local`:

```env
CENSO_API_URL=http://127.0.0.1:4000
AUTH_SECRET=<ejecutar: openssl rand -base64 32>
AUTH_GOOGLE_ID=<client id de Google OAuth>
AUTH_GOOGLE_SECRET=<client secret de Google OAuth>
```

### Crear credenciales de Google OAuth

1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. Crear un proyecto
3. APIs & Services → Credentials → Create OAuth 2.0 Client ID
4. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copiar Client ID y Client Secret a `.env.local`

### Instalar dependencias y levantar el servidor

```bash
npm install
npm run dev
```

El frontend corre en `http://localhost:3000`.

---

## 4. Configurar el contrato Soroban

El contrato ya está desplegado en Stellar Testnet. Si necesitás redesplegarlo:

```bash
cd apps/contracts/censo_trace

# Compilar
cargo build --target wasm32-unknown-unknown --release

# Desplegar
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/censo_trace.wasm \
  --source dev-key \
  --network testnet

# Guardar el CONTRACT_ID devuelto en apps/api/.env
```

---

## 5. Verificar el setup

Con el backend y frontend corriendo, verificar:

1. `http://localhost:3000` — muestra la landing page
2. Login con Google → redirige al dashboard
3. `http://localhost:4000/actors` → devuelve JSON `[]`
4. Crear un actor en el dashboard → aparece en la lista

### Probar la API directamente

```bash
# Registrar un actor
curl -X POST http://localhost:4000/actors \
  -H "Content-Type: application/json" \
  -d '{"kind":"finca","name":"Finca Test","email":"test@finca.cr"}'

# Crear un lote (reemplazar con tus headers)
curl -X POST http://localhost:4000/lotes \
  -H "Content-Type: application/json" \
  -H "x-actor-email: test@finca.cr" \
  -H "x-api-key: <api_key>" \
  -d '{"producer":"Finca Test","metadata_uri":"ipfs://test"}'
```

---

## Estructura de puertos

| Servicio | Puerto |
|----------|--------|
| Frontend (Next.js) | 3000 |
| Backend (Rust/Axum) | 4000 |
| SQLite | archivo local `apps/api/censo.db` |

---

## Despliegue en producción

### Frontend → Vercel

```bash
cd apps/web
npx vercel --prod
```

Configurar variables de entorno en el dashboard de Vercel:
- `CENSO_API_URL` → URL pública del backend
- `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`

### Backend → Fly.io

```bash
cd apps/api
fly launch       # primera vez
fly deploy       # actualizaciones
```

El `Dockerfile` debe exponer el puerto `4000` y montar el volumen para `censo.db`.

### Contrato

El contrato Soroban ya está desplegado en Testnet. No requiere redeploy para producción salvo cambios en `apps/contracts/censo_trace/src/`.

---

## Ejecutar tests

```bash
# Tests del contrato Soroban
cd apps/contracts/censo_trace
cargo test

# Tests del frontend
cd apps/web
npx vitest run
```
