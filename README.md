<div align="center">

# 🌱 Censo

### Trazabilidad agrícola verificable en Stellar · Soroban

*Cada lote de café, desde la finca hasta la taza, anclado en la blockchain.*

[![Stellar](https://img.shields.io/badge/Stellar-Soroban-7C3AED?logo=stellar&logoColor=white)](https://stellar.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![Rust](https://img.shields.io/badge/Rust-Axum-CE422B?logo=rust&logoColor=white)](https://www.rust-lang.org)
[![License](https://img.shields.io/badge/License-MIT-22c55e)](LICENSE)

</div>

---

## ¿Qué es Censo?

Censo es una plataforma de **trazabilidad on-chain para cadenas de valor agrícolas**. Cada lote de café recibe un **NFT en Soroban** cuyo historial de eventos está anclado mediante hashes SHA-256 en el contrato inteligente, haciendo que cualquier alteración de los datos sea detectable de forma criptográfica.

El agricultor puede mostrar un QR al comprador. El comprador escanea y ve el recorrido completo del lote — de la semilla al tostador — verificado por la blockchain de Stellar.

```
Finca → Cosecha → Recepción → Tueste → Empaque → Calidad → Venta
  ↓         ↓          ↓          ↓         ↓         ↓        ↓
SHA-256 anchored in Soroban smart contract on every step
```

---

## Problema que resuelve

| Sin Censo | Con Censo |
|-----------|-----------|
| El origen del café es una declaración de fe | El origen está firmado por la finca y anclado on-chain |
| El comprador no puede auditar el proceso | Cualquier persona puede verificar con un QR |
| Las certificaciones son papel | El tier (Plata/Oro/Diamante) está en el contrato |
| La manipulación de registros es indetectable | Cualquier cambio rompe el hash on-chain |

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                          apps/web                               │
│                    Next.js 15 · React 19                        │
│                                                                 │
│  Dashboard  ──  Lotes on-chain  ──  QR público  ──  Graphs     │
│       ↓                ↓                  ↓                     │
│  Server Components   NFT Score      /t/[id] page               │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST API
┌──────────────────────────▼──────────────────────────────────────┐
│                         apps/api                                │
│                  Rust · Axum · SQLite                           │
│                                                                 │
│  /lotes   /events   /sensors   /nft-score   /public            │
│       ↓                                                         │
│   Hash engine (SHA-256 · canonical JSON)                        │
│       ↓                                                         │
│   Stellar SDK  ──►  Soroban Contract  ──►  Testnet             │
└─────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    Soroban Smart Contract                       │
│                                                                 │
│  mint_lote(id, producer, metadata_uri)                         │
│  add_event(lote_id, event_idx, hash)                           │
│  certify(lote_id, tier)                                        │
│  verify_event(lote_id, event_idx) → bool                       │
└─────────────────────────────────────────────────────────────────┘
```

### Modelo hash-anchor híbrido

Los datos ricos (JSON de eventos, payload del agricultor) viven **off-chain** en SQLite. On-chain solo vive el **sha256** del payload canónico. Esto hace que:

- El costo por transacción sea mínimo (solo un hash de 32 bytes)
- Los datos sean auditables sin depender de un nodo blockchain
- Cualquier alteración del dato off-chain sea detectable al verificar

---

## Funcionalidades

### 🏭 Trazabilidad por etapas

Cada lote pasa por etapas del ciclo completo:

```
siembra → cosecha → recepcion → tueste → empaque → calidad → venta
```

Cada etapa es firmada por el actor correspondiente (finca, tostador, vendedor) y su hash se ancla en Soroban.

### 🏆 Sistema de certificación por tiers

| Tier | Criterios | Score mínimo |
|------|-----------|-------------|
| **Diamante** | Ciclo completo + integridad 100% + sensores óptimos | ≥ 88 (Grado A) |
| **Oro** | Origen + proceso + venta verificados | ≥ 72 (Grado B) |
| **Plata** | Origen e integridad mínima | ≥ 55 (Grado C) |
| **None** | Sin certificación aplicada | — |

### 📊 Score NFT — Algoritmo de verificación

El NFT de cada lote tiene un **score de 0 a 100** calculado por 4 componentes:

```
┌─────────────────────────────────────────────────────┐
│  Trazabilidad   ████████████████████░░░░  40 pts   │
│  Integridad     ████████████████░░░░░░░░  25 pts   │
│  Sensores IoT   ████████░░░░░░░░░░░░░░░░  20 pts   │
│  Certificación  ██████░░░░░░░░░░░░░░░░░░  15 pts   │
└─────────────────────────────────────────────────────┘
         Grado: A(≥88) · B(≥72) · C(≥55) · D(≥38) · F(<38)
```

**Trazabilidad (40 pts):** etapas del ciclo presentes y en orden. Ciclo completo suma bonus adicional.

**Integridad (25 pts):** proporción de eventos con hash verificado on-chain. 100% → 25 pts.

**Sensores IoT (20 pts):** lecturas de temperatura, humedad, pH y temperatura de suelo dentro de rangos óptimos para café. Degradación proporcional fuera de rango.

**Certificación (15 pts):** tier otorgado por evaluación objetiva. Diamante → 15, Oro → 11, Plata → 7.

### 🌡️ Sensores IoT + Datos climáticos NASA

- Lectura en tiempo real de estaciones IoT simuladas: `temp_aire`, `humedad`, `temp_suelo`, `ph_suelo`, `lluvia_mm`
- Integración con **NASA POWER API** (pública, sin key) para datos climáticos históricos por coordenadas
- Panel de sensores visible en el detalle de cada lote

### 📱 Verificación pública por QR

Cada lote tiene una página pública en `/t/[id]` accesible sin login. El QR que recibe el comprador/consumidor muestra:

- Productor y origen
- Todas las etapas del ciclo con su estado de verificación
- Tier de certificación
- Score NFT del lote

### 👥 Roles y enforcement

| Rol | Etapas permitidas |
|-----|------------------|
| `finca` | siembra, cosecha |
| `tostador` | recepcion, tueste, empaque |
| `vendedor` | calidad, venta |
| `admin` | todas |

---

## Stack técnico

### Frontend — `apps/web`

| Tecnología | Uso |
|-----------|-----|
| **Next.js 15** | App Router, Server Components, rutas API |
| **React 19** | UI, animaciones con Framer Motion |
| **Tailwind CSS v4** | Estilos, diseño responsive |
| **shadcn/ui + Recharts** | Componentes de UI y gráficas |
| **Auth.js** | Autenticación con Google OAuth |

### Backend — `apps/api`

| Tecnología | Uso |
|-----------|-----|
| **Rust + Axum** | API REST de alta performance |
| **SQLite + SQLx** | Persistencia off-chain con migraciones |
| **SHA-256 (sha2)** | Hash canónico de eventos |
| **stellar-sdk** | Interacción con la red Soroban |
| **reqwest** | Integración NASA POWER API |

### Blockchain

| | |
|-|-|
| **Red** | Stellar Testnet |
| **VM** | Soroban (WebAssembly) |
| **Contrato** | `soroban-sdk v22` |
| **Operaciones** | mint · add_event · certify · verify |

---

## Contrato Soroban

```rust
// Mintear un lote (crea el NFT)
fn mint_lote(env: Env, lote_id: u64, producer: String, metadata_uri: String);

// Anclar el hash de un evento
fn add_event(env: Env, lote_id: u64, event_idx: u32, hash: String);

// Certificar con tier
fn certify(env: Env, lote_id: u64, tier: String);

// Verificar integridad de un evento
fn verify_event(env: Env, lote_id: u64, event_idx: u32) -> bool;

// Obtener todos los hashes anclados de un lote
fn get_event_hashes(env: Env, lote_id: u64) -> Vec<String>;
```

---

## Cómo correr el proyecto

### Requisitos

- Node.js 20+
- Rust + Cargo
- Stellar CLI (`cargo install stellar-cli`)
- Cuenta en Stellar Testnet

### 1. Variables de entorno

```bash
# apps/web/.env.local
CENSO_API_URL=http://127.0.0.1:4000
AUTH_SECRET=<generado con openssl rand -base64 32>
AUTH_GOOGLE_ID=<Google OAuth client id>
AUTH_GOOGLE_SECRET=<Google OAuth secret>

# apps/api/.env
DATABASE_URL=sqlite://censo.db
CONTRACT_ID=<contract address en testnet>
KEY_NAME=<nombre de la llave stellar>
NETWORK=testnet
ADMIN_SECRET_KEY=<secret key de la cuenta admin>
API_PORT=4000
```

### 2. Backend

```bash
cd apps/api
cargo run
# API escuchando en http://127.0.0.1:4000
```

### 3. Frontend

```bash
cd apps/web
npm install
npm run dev
# App en http://localhost:3001
```

### 4. Desplegar contrato (primera vez)

```bash
cd apps/contract
stellar contract build
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/censo_contract.wasm \
  --network testnet \
  --source <admin-key>
```

---

## Flujo completo de un lote

```
1. Admin crea lote  →  POST /lotes
                        ↓
                    mint_lote() en Soroban
                    tx_hash guardado en SQLite

2. Finca añade evento  →  POST /lotes/:id/events
   (stage: "siembra")       ↓
                         SHA-256(canonical_payload)
                             ↓
                         add_event() en Soroban

3. Evaluación automática  →  POST /lotes/:id/evaluate
                               ↓
                           Verifica hashes on-chain
                           Calcula tier
                           certify() en Soroban

4. Score NFT  →  GET /lotes/:id/nft-score
                   ↓
               4 componentes calculados
               Grado A-F generado
               SVG del certificado disponible en /api/nft-image/:id

5. QR al comprador  →  censo.app/t/:id
                         ↓
                     Página pública sin login
                     Estado verificado contra Soroban
```

---

## Estructura del repositorio

```
censo/
├── apps/
│   ├── web/                    # Next.js 15
│   │   ├── app/
│   │   │   ├── dashboard/      # Panel principal
│   │   │   │   ├── lotes/      # Detalle de lotes
│   │   │   │   ├── products/   # Lista de lotes on-chain
│   │   │   │   └── graphs/     # Command room con métricas
│   │   │   ├── t/[id]/         # Verificación pública (QR)
│   │   │   └── api/
│   │   │       └── nft-image/  # SVG del certificado NFT
│   │   ├── components/
│   │   │   └── dashboard/      # Componentes del dashboard
│   │   └── lib/
│   │       └── censo-api.ts    # Cliente del backend
│   │
│   └── api/                    # Rust + Axum
│       ├── src/
│       │   ├── routes.rs       # Endpoints REST
│       │   ├── stellar.rs      # Integración Soroban
│       │   ├── hashing.rs      # SHA-256 canónico
│       │   ├── nft_score.rs    # Algoritmo de score
│       │   ├── sensors.rs      # IoT + NASA POWER
│       │   ├── cert.rs         # Lógica de certificación
│       │   └── roles.rs        # Enforcement de roles
│       └── migrations/         # SQLite schema
```

---

## Roadmap

- [x] Fase 1 — Contrato Soroban en Testnet (mint · add_event · verify)
- [x] Fase 2 — QR + página pública verificable `/t/[id]`
- [x] Fase 3 — Roles finca/tostador/vendedor con enforcement
- [x] Fase 4 — Certificación automática por tiers desde métricas
- [x] Fase 5 — Sensores IoT + datos climáticos NASA POWER
- [x] Fase 6 — Algoritmo NFT score (A-F) con imagen SVG generada
- [ ] Fase 7 — IPFS para metadata del NFT
- [ ] Fase 8 — Múltiples cultivos (cacao, banano, quinoa)
- [ ] Fase 9 — Mainnet + pagos de certificación en XLM

---

## Equipo

Construido para la **Stellar Hackathon 2026** por **Esteban Canales**.

> *"El agricultor tiene el trabajo más honesto del mundo. La tecnología debería hacer ese honor visible."*

---

<div align="center">

**[Ver Demo](https://censo.app)** · **[Contrato en Testnet](https://stellar.expert/explorer/testnet)**

Made with ☕ and Soroban

</div>
