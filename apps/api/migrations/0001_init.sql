-- Censo Fase 1 — esquema off-chain (modelo hash-anchor híbrido), dialecto SQLite.
-- Los datos ricos viven aquí; on-chain solo vive el sha256 de cada evento.
-- Producción puede migrar a Postgres (el módulo `db` está abstraído).

pragma foreign_keys = on;

create table if not exists actors (
    id          text primary key,              -- uuid generado por la app
    kind        text not null check (kind in ('finca', 'tostador', 'vendedor', 'admin')),
    name        text not null,
    email       text,
    created_at  text not null default (datetime('now'))
);

-- lotes.id == lote_id on-chain (id canónico devuelto por mint_lote).
create table if not exists lotes (
    id            integer primary key,
    producer      text not null,
    metadata_uri  text not null,
    tier          text not null default 'None',   -- None | Plata | Oro | Diamante
    status        text not null default 'Active',
    mint_tx_hash  text,
    created_at    text not null default (datetime('now'))
);

create table if not exists events (
    id              integer primary key autoincrement,
    lote_id         integer not null references lotes(id) on delete cascade,
    idx             integer not null,            -- índice del evento on-chain
    stage           text not null,
    actor           text not null,
    payload         text not null,               -- JSON canónico off-chain (fuente del hash)
    hash            text not null,               -- sha256 hex de canonical(payload)
    onchain_tx_hash text,
    onchain_status  text not null default 'pending', -- pending | anchored | failed
    created_at      text not null default (datetime('now')),
    unique (lote_id, idx)
);

create table if not exists certifications (
    id          integer primary key autoincrement,
    lote_id     integer not null references lotes(id) on delete cascade,
    tier        text not null,
    tx_hash     text,
    created_at  text not null default (datetime('now'))
);

create index if not exists idx_events_lote on events (lote_id, idx);
