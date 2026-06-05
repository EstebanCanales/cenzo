# Cenzo — Integración Web3

Documentación de toda la capa blockchain: Stellar, Soroban, Freighter y el modelo de hashing off-chain/on-chain.

---

## Stack Web3

| Tecnología | Versión | Rol |
|-----------|---------|-----|
| Stellar Network | Testnet | Red blockchain pública de operación |
| Soroban | SDK v22 | VM WebAssembly para contratos inteligentes |
| stellar-cli | 21+ | Interfaz de línea de comandos para desplegar e invocar contratos |
| @stellar/freighter-api | v6 | Extensión de browser para firma de transacciones |
| jose | v6 | Generación y verificación de JWT para sesiones de wallet |

---

## Arquitectura de la capa blockchain

```
Browser (Freighter)
     │
     │  window.freighter.requestAccess()
     │  window.freighter.getAddress()
     ▼
Next.js — /api/wallet/session
     │
     │  POST { publicKey, network }
     │  Genera JWT firmado con AUTH_SECRET
     │  Cookie httpOnly "wallet-session"
     ▼
Rust Backend (apps/api)
     │
     │  stellar contract invoke --id <CONTRACT_ID>
     │  --source <KEY_NAME> --network testnet
     ▼
Soroban Contract (censo_trace.wasm)
     │
     └──► Stellar Testnet (ledger)
```

---

## Contrato Soroban (`censo_trace`)

El contrato es un **registro de hashes inmutable**. No almacena datos del lote — solo sus huellas criptográficas.

### Funciones

```rust
fn initialize(env: Env, admin: Address);
fn mint_lote(env: Env, lote_id: u64, producer: String, metadata_uri: String);
fn append_event(env: Env, lote_id: u64, stage: String, actor: String, event_hash: String) -> u32;
fn set_certification(env: Env, lote_id: u64, tier: u8);
fn get_events(env: Env, lote_id: u64) -> Vec<EventRecord>;
```

### Invocación desde el backend

El backend envuelve el CLI de Stellar en `apps/api/src/stellar.rs`. Cada función del contrato tiene un método equivalente en Rust:

```rust
// Mint NFT del lote
let (lote_id, tx_hash) = stellar.mint_lote(&producer, &metadata_uri).await?;

// Anclar hash de evento
let (idx, tx_hash) = stellar.append_event(lote_id, &stage, &actor, &hash_hex).await?;

// Certificar (1=Plata, 2=Oro, 3=Diamante)
let tx_hash = stellar.set_certification(lote_id, 3).await?;
```

La variable de entorno `STELLAR_BIN` permite reemplazar el binario de `stellar` (útil en CI o contenedores).

---

## Modelo hash-anchor

El principio central de Cenzo: **datos ricos off-chain, hashes on-chain**.

```
Off-chain (SQLite)                   On-chain (Soroban storage)
─────────────────────────────────────────────────────────────────
{                                    sha256("{"actor":"mateo",
  "actor": "mateo@finca.cr",    ──►  "location":"Parcela Norte",
  "location": "Parcela Norte",       "stage":"siembra"}")
  "stage": "siembra",
  "kg": 420
}
```

### Por qué funciona

- Costo mínimo en cadena — solo 32 bytes por evento
- Los datos auditables viven off-chain en SQLite
- Cualquier alteración del JSON original rompe el hash → la manipulación es detectable

### Serialización canónica

El mismo payload debe producir siempre el mismo hash, sin importar el orden de las claves:

```rust
// apps/api/src/hashing.rs
fn canonical_json(value: &Value) -> String {
    // Las claves de cada objeto se ordenan alfabéticamente
    // Sin espacios entre tokens
    // Recursivo para objetos anidados
}

fn sha256_hex(input: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    hex::encode(hasher.finalize())
}
```

**Ejemplo:**
```json
{ "b": 1, "a": 2 }   ──►   canonical: {"a":2,"b":1}   ──►   sha256:abc123...
{ "a": 2, "b": 1 }   ──►   canonical: {"a":2,"b":1}   ──►   sha256:abc123...  ✓ mismo hash
```

---

## Flujo completo de un evento

```
1. Actor crea evento vía dashboard
      POST /lotes/:id/events
      { "stage": "cosecha", "payload": { "kg": 420, "humidity": 72 } }

2. Backend valida rol del actor (roles.rs)
      finca → solo puede registrar "siembra" y "cosecha"

3. Backend serializa canónicamente el payload (hashing.rs)
      canonical = {"humidity":72,"kg":420}
      hash      = sha256_hex(canonical) → "4d20f..."

4. Backend guarda el evento en SQLite (off-chain)
      INSERT INTO events (lote_id, stage, actor, payload, hash, ...)

5. Backend invoca el contrato Soroban (stellar.rs)
      stellar contract invoke -- append_event
        --lote_id 1 --stage cosecha --actor mateo@finca.cr --event_hash 4d20f...

6. Soroban ancla el hash en su storage (Testnet ledger)
      → devuelve idx=1 y el tx_hash de la transacción

7. Backend actualiza el evento con onchain_tx_hash
      UPDATE events SET onchain_tx_hash = 'xyz...' WHERE id = ...

8. Respuesta al frontend: { idx: 1, hash: "4d20f...", onchain_tx_hash: "xyz..." }
```

---

## Flujo de verificación pública (QR)

```
1. Productor muestra QR del lote → /t/[lote_id]

2. Comprador escanea → Next.js llama GET /public/lotes/:id

3. Backend obtiene todos los eventos de SQLite (off-chain)

4. Para cada evento:
      a. Recalcula canonical_json(payload)
      b. Recalcula sha256_hex(canonical)
      c. Compara con el hash guardado en events.hash
      d. Llama al contrato: get_events(lote_id) → Vec<EventRecord>
      e. Verifica que el hash on-chain coincide con el calculado

5. Si todos los hashes coinciden → "Verificado on-chain ✓"
   Si alguno difiere → "Advertencia: datos modificados ✗"
```

---

## Wallet Freighter

Freighter es la extensión de browser oficial de Stellar. Cenzo la usa para identificar al usuario (sin contraseña) y potencialmente firmar transacciones en el futuro.

### Flujo de conexión

```typescript
// apps/web/lib/wallet.ts
const { isConnected, requestAccess, getAddress, getNetwork } =
  await import("@stellar/freighter-api");

const access = await requestAccess();     // popup de autorización
const addr   = await getAddress();        // G... (56 chars)
const net    = await getNetwork();        // "TESTNET"
```

El import es dinámico (`await import(...)`) para evitar que Freighter intente acceder a `window` durante el SSR de Next.js.

### Sesión JWT de wallet

Una vez conectada, el frontend genera una sesión en el backend de Next.js:

```typescript
// POST /api/wallet/session
{ publicKey: "GABCD...1234", network: "TESTNET" }
```

El servidor firma un JWT con `AUTH_SECRET` y lo devuelve como cookie `httpOnly`:

```typescript
const jwt = await new SignJWT({
  sub: publicKey,
  wallet: publicKey,
  network: "TESTNET",
  actorKind: "finca",   // si la wallet está registrada como actor en el backend
  provider: "freighter",
})
.setProtectedHeader({ alg: "HS256" })
.setExpirationTime("7d")
.sign(SECRET);
```

La validación de la clave pública es estricta: debe coincidir con el formato Stellar (`/^G[A-Z2-7]{55}$/`).

### Coexistencia con Google OAuth

El sistema soporta dos métodos de autenticación simultáneamente:

| Método | Session | Uso |
|--------|---------|-----|
| Google OAuth | `next-auth` JWT | Login normal para productores con cuenta Google |
| Freighter | Cookie `wallet-session` | Login con identidad blockchain |

Ambos pueden estar activos al mismo tiempo. El dashboard detecta cuál está presente y muestra la información correspondiente.

---

## NFT Score

Cada lote tiene un score calculado sobre 4 componentes, todos derivados de datos verificables:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Score total (0–100)                          │
│                                                                 │
│  Trazabilidad    40 pts ── etapas del ciclo presentes y en orden│
│  Integridad      25 pts ── % eventos con hash on-chain válido   │
│  Sensores IoT    20 pts ── lecturas dentro de rangos óptimos    │
│  Certificación   15 pts ── tier: Diamante=15, Oro=11, Plata=7  │
└─────────────────────────────────────────────────────────────────┘
```

### Grados

| Score | Grado | Label |
|-------|-------|-------|
| ≥ 88 | A | Producto excelente |
| 72–87 | B | Producto bueno |
| 55–71 | C | Producto aceptable |
| 38–54 | D | Producto en desarrollo |
| < 38 | F | No verificable |

### Componente Trazabilidad (max 40 pts)

El ciclo completo de café tiene 7 etapas:

```
siembra → cosecha → recepcion → tueste → empaque → calidad → venta
```

Scoring:
- 5 pts por cada una de las 4 etapas mínimas (`siembra`, `cosecha`, `recepcion`, `venta`)
- 3 pts por cada etapa adicional del ciclo completo
- 4 pts bonus si están las 7 etapas (ciclo completo)

### Componente Integridad (max 25 pts)

| % eventos verificados on-chain | Puntos |
|-------------------------------|--------|
| 100% | 25 |
| ≥ 80% | 20 |
| ≥ 60% | 14 |
| ≥ 40% | 8 |
| < 40% | 3 |

### Componente Sensores (max 20 pts)

Promedia las últimas 5 lecturas. Cada métrica aporta hasta 5 pts:

| Métrica | Rango óptimo | Puntos |
|---------|-------------|--------|
| Temperatura aire | 15°C – 28°C | 0–5 |
| Humedad relativa | 55% – 92% | 0–5 |
| pH suelo | 5.2 – 7.2 | 0–5 |
| Temperatura suelo | 14°C – 26°C | 0–5 |

Los valores fuera de rango reciben una penalización proporcional a la distancia del límite.

### Componente Certificación (max 15 pts)

| Tier | Puntos |
|------|--------|
| Diamante | 15 |
| Oro | 11 |
| Plata | 7 |
| Sin certificar | 0 |

### Traits del NFT (metadata on-chain)

El NFT lleva atributos en formato ERC-compatible:

```json
[
  { "trait_type": "Score",        "value": "94",       "display_type": "number" },
  { "trait_type": "Grado",        "value": "A",        "display_type": null },
  { "trait_type": "Tier",         "value": "Diamante", "display_type": null },
  { "trait_type": "Trazabilidad", "value": "Ciclo completo" },
  { "trait_type": "Integridad",   "value": "Todos verificados" },
  { "trait_type": "Sensores",     "value": "Condiciones óptimas" },
  { "trait_type": "Etapas",       "value": "7",        "display_type": "number" },
  { "trait_type": "Verificados",  "value": "7",        "display_type": "number" }
]
```

---

## Imagen del certificado NFT

La ruta `GET /api/nft-image/[id]` genera un SVG dinámico con el score y tier del lote. Es la imagen asociada al NFT en la blockchain — única por lote, generada en tiempo real desde los datos verificados.

---

## Consideraciones de seguridad

- **La clave privada del admin nunca sale del backend.** El backend firma las transacciones de Soroban usando `KEY_NAME` (clave configurada en el keystore de `stellar-cli`), no desde el browser.
- **Freighter nunca tiene acceso a la clave admin.** Solo identifica al usuario que está navegando el dashboard.
- **Los hashes son de un solo sentido.** SHA-256 es una función unidireccional: conocer el hash no permite reconstruir el payload.
- **La sesión JWT de wallet es httpOnly.** El JavaScript del browser no puede leer la cookie — protegido contra XSS.
- **La validación de clave pública es estricta.** Formato Stellar `G[A-Z2-7]{55}` — rechaza cualquier valor que no sea una clave pública válida de Stellar.
