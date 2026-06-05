-- Fase 5 — sensores IoT + clima NASA POWER

create table if not exists sensor_readings (
    id          integer primary key autoincrement,
    lote_id     integer references lotes(id) on delete cascade,
    station_id  text not null,                 -- "finca-01" | "tostadora-norte" | etc.
    temp_aire   real,                          -- °C
    humedad     real,                          -- %
    temp_suelo  real,                          -- °C
    ph_suelo    real,
    lluvia_mm   real,                          -- mm acumulados 24h
    lat         real,
    lon         real,
    recorded_at text not null default (datetime('now'))
);

create table if not exists climate_cache (
    id          integer primary key autoincrement,
    lat         real not null,
    lon         real not null,
    date_key    text not null,                 -- YYYYMMDD
    t2m_max     real,                          -- temp max °C
    t2m_min     real,                          -- temp min °C
    prectotcorr real,                          -- precipitación mm
    rh2m        real,                          -- humedad relativa %
    fetched_at  text not null default (datetime('now')),
    unique(lat, lon, date_key)
);

create index if not exists idx_sensor_lote on sensor_readings (lote_id, recorded_at desc);
create index if not exists idx_climate_loc on climate_cache (lat, lon, date_key);
