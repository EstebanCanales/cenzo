# Cenzo — Documentación técnica

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
│  get_event_hashes(lote_id) → Vec<String>                       │
└─────────────────────────────────────────────────────────────────┘
```

### Modelo hash-anchor híbrido

Los datos ricos (JSON de eventos, payload del agricultor) viven **off-chain** en SQLite. On-chain solo vive el **sha256** del payload canónico.

- Costo por transacción mínimo — solo 32 bytes en cadena
- Datos auditables sin depender de un nodo blockchain
- Cualquier alteración del dato off-chain rompe el hash on-chain

---

## Stack

### Frontend — `apps/web`

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Next.js | 15 | App Router, Server Components, rutas API |
| React | 19 | UI, animaciones con Framer Motion |
| Tailwind CSS | v4 | Estilos utility-first |
| shadcn/ui + Recharts | — | Componentes y gráficas |
| Auth.js | v5 | Google OAuth + Freighter wallet session |
| @stellar/freighter-api | v6 | Conexión con wallet Freighter |
| jose | v6 | JWT para sesiones de wallet |

### Backend — `apps/api`

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Rust | 1.78 | Lenguaje base |
| Axum | 0.7 | Framework HTTP |
| SQLx | 0.8 | Queries SQLite async |
| sha2 | 0.10 | Hash canónico de eventos |
| reqwest | 0.12 | Cliente HTTP (NASA POWER API) |
| tokio | 1 | Runtime async |
| serde | 1 | Serialización JSON |

### Blockchain

| | |
|-|-|
| Red | Stellar Testnet |
| VM | Soroban (WebAssembly) |
| SDK | soroban-sdk v22 |
| CLI | stellar-cli |

---

## Contrato Soroban

```rust
fn mint_lote(env: Env, lote_id: u64, producer: String, metadata_uri: String);
fn add_event(env: Env, lote_id: u64, event_idx: u32, hash: String);
fn certify(env: Env, lote_id: u64, tier: String);
fn verify_event(env: Env, lote_id: u64, event_idx: u32) -> bool;
fn get_event_hashes(env: Env, lote_id: u64) -> Vec<String>;
```

---

## API REST

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/lotes` | Lista todos los lotes |
| POST | `/lotes` | Crea lote + mint NFT on-chain |
| GET | `/lotes/:id` | Detalle con eventos y verificación |
| POST | `/lotes/:id/events` | Añade evento y ancla hash |
| POST | `/lotes/:id/evaluate` | Evalúa y certifica tier |
| GET | `/lotes/:id/nft-score` | Score NFT (A–F, 4 componentes) |
| GET | `/public/lotes/:id` | Vista pública sin auth (QR) |
| GET | `/sensors/readings` | Lecturas IoT recientes |
| POST | `/sensors/simulate` | Simula lectura IoT |
| GET | `/sensors/climate/:lat/:lon` | Datos NASA POWER API |
| GET | `/actors` | Lista actores registrados |
| POST | `/actors` | Registra actor con rol |

---

## Algoritmo NFT Score

Score de 0–100 calculado sobre 4 componentes:

```
Trazabilidad   (40 pts) — etapas del ciclo presentes y en orden
Integridad     (25 pts) — % eventos con hash verificado on-chain
Sensores IoT   (20 pts) — lecturas dentro de rangos óptimos
Certificación  (15 pts) — tier: Diamante=15, Oro=11, Plata=7
```

**Rangos óptimos de sensores:**

| Sensor | Mínimo | Máximo |
|--------|--------|--------|
| Temperatura aire | 15°C | 28°C |
| Humedad | 55% | 92% |
| pH suelo | 5.2 | 7.2 |
| Temperatura suelo | 14°C | 26°C |

**Grados:** A (≥88) · B (≥72) · C (≥55) · D (≥38) · F (<38)

---

## Base de datos (SQLite)

```sql
actors       — id, kind (finca|tostador|vendedor|admin), name, email
lotes        — id, producer, metadata_uri, tier, status, mint_tx_hash
events       — lote_id, idx, stage, actor, payload (JSON), hash, onchain_tx_hash
certifications — lote_id, tier, criteria (JSON), tx_hash
sensor_readings — station_id, lote_id, temp_aire, humedad, temp_suelo, ph_suelo, lluvia_mm
climate_cache   — lat, lon, date, data (JSON)
```

---

## Roles y etapas permitidas

| Rol | Etapas |
|-----|--------|
| `finca` | siembra, cosecha |
| `tostador` | recepcion, tueste, empaque |
| `vendedor` | calidad, venta |
| `admin` | todas |

---

## Variables de entorno

### `apps/api/.env`

```env
DATABASE_URL=sqlite://censo.db
CONTRACT_ID=<soroban contract address>
KEY_NAME=<stellar key name>
NETWORK=testnet
ADMIN_SECRET_KEY=<secret key>
API_PORT=4000
```

### `apps/web/.env.local`

```env
CENSO_API_URL=http://127.0.0.1:4000
AUTH_SECRET=<openssl rand -base64 32>
AUTH_GOOGLE_ID=<google oauth client id>
AUTH_GOOGLE_SECRET=<google oauth secret>
```

---

## Setup local

```bash
# Backend
cd apps/api
cargo run

# Frontend
cd apps/web
npm install
npm run dev
```

## Despliegue

- **Frontend:** Vercel (`vercel` CLI desde `apps/web`)
- **Backend:** Fly.io o Railway (`fly deploy` desde `apps/api`)
- **Contrato:** ya desplegado en Stellar Testnet

---

## Estructura del repositorio

```
cenzo/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   │   ├── dashboard/        # Panel principal
│   │   │   │   ├── lotes/        # Detalle de lotes on-chain
│   │   │   │   ├── products/     # Lista de lotes con score NFT
│   │   │   │   └── graphs/       # Command room con métricas
│   │   │   ├── t/[id]/           # Verificación pública (QR)
│   │   │   └── api/
│   │   │       ├── nft-image/    # SVG del certificado NFT
│   │   │       └── wallet/       # Sesión Freighter JWT
│   │   ├── components/dashboard/ # Componentes del dashboard
│   │   └── lib/
│   │       ├── censo-api.ts      # Cliente REST
│   │       └── wallet.ts         # Freighter wrapper
│   │
│   └── api/
│       └── src/
│           ├── routes.rs         # Endpoints REST
│           ├── stellar.rs        # Integración Soroban
│           ├── hashing.rs        # SHA-256 canónico
│           ├── nft_score.rs      # Algoritmo de score
│           ├── sensors.rs        # IoT + NASA POWER
│           ├── cert.rs           # Lógica de certificación
│           └── roles.rs          # Enforcement de roles
```
