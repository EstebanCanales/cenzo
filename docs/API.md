# Cenzo — Referencia de API REST

Base URL: `http://localhost:4000` (local) · configurada en `CENSO_API_URL`

## Autenticación

Todas las rutas protegidas requieren dos headers:

```
x-actor-email: actor@ejemplo.com
x-api-key:     <api_key_del_actor>
```

Las rutas públicas (`/public/*`) no requieren autenticación.

---

## Actores

### `GET /actors`

Lista todos los actores registrados.

**Respuesta:**
```json
[
  {
    "id": 1,
    "kind": "finca",
    "name": "Finca Don Mateo",
    "email": "mateo@finca.cr"
  }
]
```

---

### `POST /actors`

Registra un nuevo actor con su rol.

**Body:**
```json
{
  "kind": "finca",
  "name": "Finca Don Mateo",
  "email": "mateo@finca.cr"
}
```

**Roles válidos:** `finca` · `tostador` · `vendedor` · `admin`

**Respuesta:** `201 Created`
```json
{
  "id": 1,
  "kind": "finca",
  "name": "Finca Don Mateo",
  "email": "mateo@finca.cr",
  "api_key": "<api_key_generada>"
}
```

---

## Lotes

### `GET /lotes`

Lista todos los lotes con su estado y tier de certificación.

**Respuesta:**
```json
[
  {
    "id": 1,
    "producer": "Finca Don Mateo",
    "metadata_uri": "ipfs://...",
    "tier": "Diamante",
    "status": "active",
    "mint_tx_hash": "abc123..."
  }
]
```

---

### `POST /lotes`

Crea un lote y hace mint del NFT on-chain en Soroban.

**Body:**
```json
{
  "producer": "Finca Don Mateo",
  "metadata_uri": "ipfs://QmXxx..."
}
```

**Respuesta:** `201 Created`
```json
{
  "id": 1,
  "producer": "Finca Don Mateo",
  "metadata_uri": "ipfs://QmXxx...",
  "status": "active",
  "mint_tx_hash": "abc123def456..."
}
```

> El backend llama a `mint_lote` en el contrato Soroban y guarda el tx hash.

---

### `GET /lotes/:id`

Detalle completo del lote con eventos y verificación on-chain.

**Respuesta:**
```json
{
  "id": 1,
  "producer": "Finca Don Mateo",
  "tier": "Diamante",
  "status": "active",
  "mint_tx_hash": "abc123...",
  "events": [
    {
      "idx": 0,
      "stage": "siembra",
      "actor": "mateo@finca.cr",
      "payload": { "location": "Parcela Norte", "date": "2026-05-01" },
      "hash": "sha256:9f3a...",
      "onchain_tx_hash": "xyz789...",
      "verified": true
    }
  ]
}
```

---

### `POST /lotes/:id/events`

Añade un evento al lote y ancla su hash en Soroban.

**Body:**
```json
{
  "stage": "cosecha",
  "payload": {
    "kg": 420,
    "humidity": 72,
    "location": "Parcela Norte"
  }
}
```

**Stages permitidas por rol:**

| Rol | Stages |
|-----|--------|
| `finca` | `siembra`, `cosecha` |
| `tostador` | `recepcion`, `tueste`, `empaque` |
| `vendedor` | `calidad`, `venta` |
| `admin` | todas |

**Respuesta:** `201 Created`
```json
{
  "idx": 1,
  "stage": "cosecha",
  "hash": "sha256:4d20...",
  "onchain_tx_hash": "def456..."
}
```

---

### `POST /lotes/:id/evaluate`

Evalúa el lote y otorga un tier de certificación.

**Respuesta:**
```json
{
  "tier": "Diamante",
  "criteria": {
    "traceability": 40,
    "integrity": 25,
    "sensors": 18,
    "certification": 15
  },
  "tx_hash": "ghi789..."
}
```

---

### `GET /lotes/:id/nft-score`

Devuelve el score NFT calculado (0–100) con los 4 componentes.

**Respuesta:**
```json
{
  "score": 94,
  "grade": "A",
  "components": {
    "traceability": 40,
    "integrity": 24,
    "sensors": 18,
    "certification": 12
  }
}
```

**Grados:** `A` (≥88) · `B` (≥72) · `C` (≥55) · `D` (≥38) · `F` (<38)

---

## Vista pública

### `GET /public/lotes/:id`

Vista pública del lote sin autenticación. Usada por la página QR `/t/[id]`.

**Respuesta:**
```json
{
  "id": 1,
  "producer": "Finca Don Mateo",
  "tier": "Diamante",
  "score": 94,
  "grade": "A",
  "events": [ ... ],
  "verified_on_chain": true
}
```

---

## Sensores IoT

### `GET /sensors/readings`

Devuelve las últimas lecturas de sensores registradas.

**Respuesta:**
```json
[
  {
    "id": 1,
    "station_id": "AS01",
    "lote_id": 1,
    "temp_aire": 22.5,
    "humedad": 78.0,
    "temp_suelo": 19.0,
    "ph_suelo": 6.2,
    "lluvia_mm": 3.1,
    "recorded_at": "2026-05-27T10:00:00Z"
  }
]
```

---

### `POST /sensors/simulate`

Simula una lectura de sensor para un lote (demo/dev).

**Body:**
```json
{
  "station_id": "AS01",
  "lote_id": 1
}
```

**Respuesta:** `201 Created` — misma estructura que `GET /sensors/readings[0]`

---

### `GET /sensors/climate/:lat/:lon`

Consulta datos climáticos históricos desde la NASA POWER API para una ubicación.

**Ejemplo:** `GET /sensors/climate/9.8/-84.1`

**Respuesta:**
```json
{
  "lat": 9.8,
  "lon": -84.1,
  "date": "2026-05-27",
  "data": {
    "T2M": 22.4,
    "RH2M": 80.1,
    "PRECTOTCORR": 4.2
  }
}
```

> Los datos se cachean en `climate_cache` para evitar llamadas repetidas a la API de la NASA.

---

## Códigos de error

| Código | Descripción |
|--------|-------------|
| `400` | Body inválido o stage no permitida para el rol |
| `401` | Headers de autenticación faltantes o inválidos |
| `403` | El actor no tiene permiso para esta operación |
| `404` | Lote o recurso no encontrado |
| `409` | Conflicto (ej: lote ya certificado) |
| `500` | Error interno — revisar logs del servidor |
