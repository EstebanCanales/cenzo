# Cenzo — Contrato Soroban

Documentación del contrato inteligente `censo_trace` desplegado en Stellar Testnet.

## Propósito

El contrato actúa como **registro inmutable de trazabilidad**. No almacena los datos completos del lote — eso vive off-chain en SQLite. Solo almacena los **hashes SHA-256** de cada evento, lo que permite verificar que los datos off-chain no fueron alterados.

```
off-chain (SQLite)                on-chain (Soroban)
─────────────────────────────────────────────────────
evento completo (JSON)    ──►    sha256(evento)
datos del lote            ──►    mint_lote(id, producer, uri)
tier de certificación     ──►    certify(lote_id, tier)
```

---

## Funciones del contrato

### `initialize`

```rust
fn initialize(env: Env, admin: Address);
```

Inicializa el contrato con la dirección del administrador. Solo puede llamarse una vez.

---

### `mint_lote`

```rust
fn mint_lote(env: Env, lote_id: u64, producer: String, metadata_uri: String);
```

Registra un nuevo lote en la cadena.

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `lote_id` | `u64` | ID único del lote (asignado por el backend) |
| `producer` | `String` | Nombre del productor |
| `metadata_uri` | `String` | URI de metadatos (IPFS o URL) |

**Restricciones:** Solo el admin puede llamar esta función.

---

### `add_event`

```rust
fn add_event(env: Env, lote_id: u64, event_idx: u32, hash: String);
```

Ancla el hash de un evento en la cadena.

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `lote_id` | `u64` | ID del lote al que pertenece el evento |
| `event_idx` | `u32` | Índice del evento (0-based, incremental) |
| `hash` | `String` | SHA-256 del payload canónico del evento |

**Restricciones:** El lote debe existir. El `event_idx` debe ser el siguiente en la secuencia.

---

### `certify`

```rust
fn certify(env: Env, lote_id: u64, tier: String);
```

Registra el tier de certificación del lote en la cadena.

**Tiers válidos:** `Plata` · `Oro` · `Diamante`

---

### `verify_event`

```rust
fn verify_event(env: Env, lote_id: u64, event_idx: u32) -> bool;
```

Verifica que el hash del evento `event_idx` existe en la cadena para el lote dado.

Devuelve `true` si existe, `false` si no hay registro.

---

### `get_event_hashes`

```rust
fn get_event_hashes(env: Env, lote_id: u64) -> Vec<String>;
```

Devuelve todos los hashes registrados para un lote, en orden de inserción.

Útil para auditoría completa de la cadena de custodia.

---

## Modelo hash-anchor

El backend calcula el hash antes de llamar al contrato:

```rust
// hashing.rs
fn canonical_hash(payload: &serde_json::Value) -> String {
    let canonical = serde_json::to_string(payload).unwrap();
    let digest = sha2::Sha256::digest(canonical.as_bytes());
    format!("sha256:{}", hex::encode(digest))
}
```

El JSON se serializa de forma canónica (claves ordenadas) para garantizar que el mismo payload siempre produce el mismo hash.

**Flujo de verificación:**

```
1. Usuario escanea QR → /t/[id]
2. Frontend llama GET /public/lotes/:id
3. Backend obtiene evento off-chain (payload JSON)
4. Backend llama verify_event en Soroban
5. Backend recalcula hash del payload
6. Compara hash calculado con hash on-chain
7. Si coinciden → "Verificado on-chain" ✓
```

---

## Tests del contrato

Los tests están en `apps/contracts/censo_trace/src/test.rs`. Cada test genera un snapshot en `test_snapshots/`.

```bash
cd apps/contracts/censo_trace
cargo test
```

**Tests incluidos:**

| Test | Qué verifica |
|------|-------------|
| `initialize_sets_admin` | El admin queda registrado correctamente |
| `initialize_twice_fails` | No se puede inicializar dos veces |
| `mint_lote_creates_nft` | El mint registra el lote en storage |
| `mint_increments_ids` | Los IDs se asignan secuencialmente |
| `append_event_anchors_hash` | El hash queda anclado en la cadena |
| `append_multiple_events_in_order` | Los eventos se insertan en orden correcto |
| `append_to_missing_lote_errors` | Error si el lote no existe |
| `get_missing_lote_errors` | Error al consultar lote inexistente |
| `set_certification_updates_tier` | El tier se actualiza correctamente |

---

## Despliegue

El contrato está desplegado en **Stellar Testnet**. El `CONTRACT_ID` se configura en `apps/api/.env`.

Para ver el contrato en el explorador:

```
https://stellar.expert/explorer/testnet/contract/<CONTRACT_ID>
```

Ver instrucciones de redeploy en [SETUP.md](./SETUP.md#4-configurar-el-contrato-soroban).
