# Cenzo — Base de datos

Esquema SQLite del backend (`apps/api`). Las migraciones viven en `apps/api/migrations/`.

---

## Tablas

### `actors`

Usuarios del sistema con su rol en la cadena de suministro.

```sql
CREATE TABLE actors (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  kind      TEXT NOT NULL,   -- finca | tostador | vendedor | admin
  name      TEXT NOT NULL,
  email     TEXT NOT NULL UNIQUE,
  api_key   TEXT NOT NULL UNIQUE
);
```

**Roles:**

| `kind` | Descripción | Etapas permitidas |
|--------|-------------|-------------------|
| `finca` | Productor agrícola | `siembra`, `cosecha` |
| `tostador` | Procesador | `recepcion`, `tueste`, `empaque` |
| `vendedor` | Comercializador | `calidad`, `venta` |
| `admin` | Administrador | todas |

---

### `lotes`

Lotes de producción. Cada lote tiene un NFT correspondiente en Soroban.

```sql
CREATE TABLE lotes (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  producer       TEXT NOT NULL,
  metadata_uri   TEXT NOT NULL,
  tier           TEXT,              -- NULL | Plata | Oro | Diamante
  status         TEXT NOT NULL DEFAULT 'active',
  mint_tx_hash   TEXT               -- tx hash del mint en Soroban
);
```

---

### `events`

Eventos del ciclo de vida del lote. El hash de cada evento se ancla on-chain.

```sql
CREATE TABLE events (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  lote_id          INTEGER NOT NULL REFERENCES lotes(id),
  idx              INTEGER NOT NULL,          -- índice on-chain (0-based)
  stage            TEXT NOT NULL,             -- siembra | cosecha | ...
  actor            TEXT NOT NULL,             -- email del actor
  payload          TEXT NOT NULL,             -- JSON con datos del evento
  hash             TEXT NOT NULL,             -- sha256 del payload canónico
  onchain_tx_hash  TEXT,                      -- tx hash de add_event en Soroban
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Stages válidas:**

`siembra` → `cosecha` → `recepcion` → `tueste` → `empaque` → `calidad` → `venta`

---

### `certifications`

Registro de certificaciones otorgadas a lotes.

```sql
CREATE TABLE certifications (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  lote_id   INTEGER NOT NULL REFERENCES lotes(id),
  tier      TEXT NOT NULL,       -- Plata | Oro | Diamante
  criteria  TEXT NOT NULL,       -- JSON con puntajes por componente
  tx_hash   TEXT,                -- tx hash de certify en Soroban
  issued_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Estructura de `criteria`:**
```json
{
  "traceability": 40,
  "integrity": 25,
  "sensors": 18,
  "certification": 15
}
```

---

### `sensor_readings`

Lecturas de sensores IoT asociadas a lotes.

```sql
CREATE TABLE sensor_readings (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  station_id  TEXT NOT NULL,
  lote_id     INTEGER REFERENCES lotes(id),
  temp_aire   REAL,    -- °C  [óptimo: 15–28]
  humedad     REAL,    -- %   [óptimo: 55–92]
  temp_suelo  REAL,    -- °C  [óptimo: 14–26]
  ph_suelo    REAL,    --     [óptimo: 5.2–7.2]
  lluvia_mm   REAL,    -- mm
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Estas lecturas alimentan el componente **Sensores IoT** del NFT score (20 pts).

---

### `climate_cache`

Caché de datos climáticos de la NASA POWER API.

```sql
CREATE TABLE climate_cache (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  lat     REAL NOT NULL,
  lon     REAL NOT NULL,
  date    TEXT NOT NULL,
  data    TEXT NOT NULL,   -- JSON con parámetros climáticos
  UNIQUE(lat, lon, date)
);
```

Evita llamadas repetidas a la API de la NASA para la misma ubicación y fecha.

---

## Migraciones

| Archivo | Contenido |
|---------|-----------|
| `0001_init.sql` | Esquema principal: `actors`, `lotes`, `events`, `certifications` |
| `0002_sensors.sql` | Tablas de sensores: `sensor_readings`, `climate_cache` |

Las migraciones se aplican automáticamente al arrancar el backend (SQLx migrator).

---

## Relaciones

```
actors
  └── events.actor (email, no FK directa)

lotes
  ├── events.lote_id ──────► events
  ├── certifications.lote_id ─► certifications
  └── sensor_readings.lote_id ─► sensor_readings
```

---

## Invariantes importantes

- `events.idx` debe ser secuencial por `lote_id` — coincide con el índice on-chain en Soroban.
- `events.hash` es inmutable una vez insertado — cualquier cambio en el payload rompe la verificación on-chain.
- `lotes.mint_tx_hash` y `events.onchain_tx_hash` pueden ser `NULL` si la transacción Stellar aún no fue confirmada.
- `certifications` puede tener múltiples filas por lote, pero solo el tier más reciente es el vigente.
