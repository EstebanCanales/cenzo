# Censo — Fase 1: Cimiento on-chain (trazabilidad Soroban)

**Fecha:** 2026-06-04
**Estado:** Aprobado
**Fase:** 1 de 5 (cada fase tiene su propio ciclo spec → plan → build)

---

## Contexto y decisiones foundational

Censo pasa de un dashboard de trazabilidad **100% mock** a un producto real: trazabilidad de café finca → procesamiento → tueste → venta, verificable de forma inmutable por el consumidor vía QR, respaldada por contratos Soroban reales en Stellar.

Decisiones que enmarcan todo el proyecto:

- **Objetivo:** producto real para agricultores + NFT + Soroban a full funcionamiento.
- **Modelo NFT:** un NFT **por lote** que funciona a la vez como **trazabilidad** (acumula eventos) y como **certificado** (carga el tier diamante/oro/plata).
- **Custodia de llaves:** **custodial**. El agricultor entra con Google; el backend Rust custodia las llaves Stellar y firma las transacciones Soroban por él. Cero wallet, cero fricción. El backend es el punto de confianza.
- **Modelo de datos (enfoque ① hash-anchor híbrido):** los datos ricos de cada evento (ubicación, lecturas de sensor, fotos, detalle, productor/finca) viven **off-chain** (Postgres). On-chain (Soroban) vive el NFT del lote con la lista de **hashes** de eventos + tier + metadata URI + owner. Verificación = recalcular el hash del dato off-chain y compararlo con el on-chain; cualquier manipulación rompe el hash y se detecta.

### Estado actual del código (el gap)

| Pieza | Estado real hoy |
|---|---|
| Dashboard `apps/web` | UI completa pero data hardcodeada en `lib/dashboard.ts` |
| "Stellar proof" / `stellarRef` / "Contratos: 41" | Strings falsos, cero blockchain |
| API Rust `apps/api` | Solo `/health` (stub Axum) |
| QR / página pública | No existen |
| Skill `stellar-nextjs-rust-auth` | Staged, sin usar |

### Decomposición en fases (todo el producto, incremental)

| Fase | Qué |
|---|---|
| **1. Cimiento on-chain** (este spec) | Contrato Soroban (mint lote-NFT, append_event-hash, set_cert) en testnet + backend Rust custodial + DB. 1 lote real escrito y leído on-chain, reemplaza mock |
| 2. QR + página pública | QR por lote → página pública (sin login) que lee on-chain + off-chain + links a Stellar Explorer |
| 3. Eventos por actores | UI finca/tostador/vendedor para registrar eventos, roles en backend, dashboard lee real |
| 4. Certificación tiers | Lógica diamante/oro/plata desde métricas → escrita on-chain como cert del NFT |
| 5. Sensores/satélite | IoT + NASA alimentan métricas |

**Este documento cubre solo la Fase 1.** Las fases 2–5 obtendrán su propio spec cuando lleguemos a ellas.

---

## Meta de Fase 1

Un lote de café real, minteado como NFT en Soroban testnet, con eventos hash-anclados on-chain, escrito y leído a través del backend Rust, mostrado en el dashboard reemplazando el mock para ese lote. Define el cimiento del que dependen todas las demás fases.

---

## Componentes

### 1. Contrato Soroban — `apps/contracts/censo_trace`

Un contrato registry = la colección "Censo". Cada lote = un `token_id` no-fungible.

**Storage:**
- `Admin` — address custodial (llave del backend), única autorizada a escribir.
- `LoteCount` — contador de token ids.
- `Lote { owner, producer, metadata_uri, tier, status, event_count }`
  - `owner`: en Fase 1 = address de la plataforma (custodial); `producer` se guarda como dato (`Symbol`/`String`, identificador del actor finca off-chain).
- `Event` indexado por `(lote_id, idx)` → `{ stage: Symbol, actor: Symbol, timestamp (ledger), hash: BytesN<32> }`
  - `actor` es un **identificador** (`Symbol`/`String`) del actor off-chain (finca/tostador/vendedor), **no** una `Address` — en el modelo custodial los actores no tienen wallet Stellar propia; el admin firma todo. (Cuentas custodiales por actor con address propia = opción de una fase posterior.)
- `Tier` enum: `None | Plata | Oro | Diamante`
- `Status` enum (estado del lote, p. ej. `Active`)

**Funciones:**
- `initialize(admin)` — fija el admin una sola vez.
- `mint_lote(producer, metadata_uri) -> lote_id` — admin only, crea el NFT del lote.
- `append_event(lote_id, stage, event_hash)` — admin only, ancla el hash + timestamp del ledger, incrementa `event_count`.
- `set_certification(lote_id, tier)` — admin only.
- Vistas: `get_lote(lote_id)`, `get_event(lote_id, idx)`, `get_events(lote_id)`, `lote_count()`.

**Reglas:**
- `admin.require_auth()` en todas las escrituras.
- Emite contract events en `mint` / `append` / `cert` para indexación futura.
- Transfer de NFT = YAGNI por ahora (owner = productor/plataforma); se agrega cuando una fase lo requiera.

### 2. Backend Rust — `apps/api` (expandir el stub)

Módulos (patrón del skill `stellar-nextjs-rust-auth`):

- `config` — network (testnet), RPC URL, contract id, `ADMIN_SECRET_KEY` (env), DB URL.
- `auth` — verifica la sesión NextAuth/JWT del frontend (identidad Google). Protege las rutas de escritura.
- `db` — Postgres vía `sqlx`. Tablas: `actors`, `lotes`, `events`, `certifications` (datos ricos off-chain + refs on-chain cacheadas).
- `stellar` — cliente Soroban: build/sign/submit con la admin key, simulate, read del estado del contrato. Calcula el hash de evento = `sha256(JSON canónico del evento)`.
- `models` — tipos request/response (forma compartida con el frontend).
- `routes`:

| Método | Ruta | Qué | Auth |
|---|---|---|---|
| POST | `/lotes` | crea lote: row off-chain + `mint_lote` on-chain → lote_id + tx hash | sí |
| POST | `/lotes/:id/events` | guarda evento off-chain, hash, `append_event` on-chain → tx hash | sí |
| POST | `/lotes/:id/certification` | `set_certification` on-chain | sí (rol) |
| GET | `/lotes/:id` | off-chain + verificación on-chain (recalcula hashes) | sí |
| GET | `/lotes` | lista | sí |
| GET | `/public/lotes/:id` | lectura pública (target del QR — la usa Fase 2) | no |
| GET | `/health` | se queda | no |

### 3. Frontend — `apps/web`

- Mata el mock: `lib/dashboard.ts` (arrays estáticos) → `lib/api.ts` (cliente del backend Rust). **Se conservan los types, cambia la fuente de datos.**
- Mapeos a datos reales:
  - `stellarRef` → tx hash real → link `https://stellar.expert/explorer/testnet/tx/{hash}`
  - `stellarStatus` → `verified | pending` real derivado del hash check
  - `metrics.contracts` → conteo real de eventos on-chain
- UI mínima de escritura: form para crear lote + agregar evento, cableando el `ProductDrawer` existente al API.
- Migración del dashboard incremental: en Fase 1 basta con que el detalle de producto + al menos una card lean datos reales; el resto del dashboard se migra progresivamente.

---

## Flujo de datos

**Write (agregar evento):**
1. Frontend autenticado → `POST /lotes/:id/events`.
2. Backend canonicaliza el JSON del evento (keys ordenadas).
3. `sha256` → hash.
4. Guarda el evento completo en Postgres.
5. Arma la tx Soroban `append_event(lote_id, stage, hash)`.
6. Firma con la admin key (custodial).
7. Submit a testnet RPC.
8. Guarda `tx_hash` + ledger en Postgres.
9. Responde al frontend.

**Read / verify:**
1. `GET /lotes/:id`.
2. Backend lee off-chain (Postgres) + on-chain (contrato).
3. Por cada evento recalcula `sha256` del dato off-chain y lo compara con el hash on-chain.
4. Marca `verified | tampered | pending`.
5. Devuelve la vista mergeada + links a Stellar Explorer.

---

## Manejo de errores

- **Tx on-chain falla** (error de simulación / fee insuficiente / RPC caído): el dato off-chain ya quedó guardado; el evento se marca `pending_onchain` y es reintentable. La UI no se bloquea por la latencia de la cadena (write off-chain primero, anclaje on-chain reintentable).
- **Hash mismatch en read:** status `tampered` bien visible — es el value prop central.
- **Auth:** 401 sin sesión; 403 sin rol.
- **Red:** solo testnet en Fase 1, gated por config.

---

## Testing

- **Contrato:** tests Soroban (mint, append, cert, auth-required, get) con el test env del SDK.
- **Backend:** tests de canonicalización + hash, tests de rutas con el módulo `stellar` mockeado, un test de integración contra testnet detrás de un flag, tests de DB.
- **Frontend:** se conserva `dashboard.test.ts`; se agregan tests del cliente API + del mapeo API → `ProductCard`.

---

## Layout del repo

```
apps/
  web/                 (Next.js — swap mock → API client)
  api/                 (Rust — config/auth/db/stellar/models/routes)
  contracts/
    censo_trace/       (contrato Soroban)
```

**Variables de entorno nuevas:** `STELLAR_NETWORK`, `SOROBAN_RPC_URL`, `CENSO_CONTRACT_ID`, `ADMIN_SECRET_KEY`, `DATABASE_URL`.

---

## Knobs (defaults; ajustables)

- **DB:** Postgres vía `sqlx` (SQLite para dev si se prefiere simpleza).
- **Hash:** `sha256` sobre JSON canónico (keys ordenadas).
- **Red:** testnet en Fase 1.
- **Crates Soroban:** `soroban-sdk` + cliente RPC; versiones exactas se confirman en el plan de implementación.

---

## Lo que NO cubre Fase 1

- QR y página pública de verificación (Fase 2).
- UI completa de roles por actor finca/tostador/vendedor (Fase 3).
- Lógica de cálculo de tiers de certificación (Fase 4) — Fase 1 solo expone `set_certification` en el contrato.
- Ingesta de sensores IoT / satélite (Fase 5).
- Mainnet, transfer de NFT, mercado secundario.
