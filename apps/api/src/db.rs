use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use sqlx::SqlitePool;

pub type Db = SqlitePool;

#[derive(sqlx::FromRow)]
pub struct LoteRow {
    pub id: i64,
    pub producer: String,
    pub metadata_uri: String,
    pub tier: String,
    pub status: String,
    pub mint_tx_hash: Option<String>,
}

#[derive(sqlx::FromRow)]
pub struct ActorRow {
    pub id: String,
    pub kind: String,
    pub name: String,
    pub email: Option<String>,
}

#[derive(sqlx::FromRow)]
pub struct EventRow {
    pub idx: i64,
    pub stage: String,
    pub actor: String,
    pub payload: String,
    pub hash: String,
    pub onchain_tx_hash: Option<String>,
    pub onchain_status: String,
    pub created_at: String,
}

/// Conecta a SQLite. Acepta una URL `sqlite://path?mode=rwc`; extrae el path
/// de archivo y crea la base si no existe.
pub async fn connect(database_url: &str) -> anyhow::Result<Db> {
    let raw = database_url
        .trim_start_matches("sqlite://")
        .trim_start_matches("sqlite:")
        .split('?')
        .next()
        .unwrap_or(database_url);

    // Resuelve un path relativo contra el directorio del crate (independiente del CWD).
    let path = if std::path::Path::new(raw).is_absolute() {
        std::path::PathBuf::from(raw)
    } else {
        std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join(raw)
    };

    let opts = SqliteConnectOptions::new()
        .filename(&path)
        .create_if_missing(true)
        .foreign_keys(true);

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(opts)
        .await?;
    Ok(pool)
}

/// Aplica el esquema (idempotente, `if not exists`).
pub async fn init_schema(db: &Db) -> anyhow::Result<()> {
    let schema = include_str!("../migrations/0001_init.sql");
    sqlx::raw_sql(schema).execute(db).await?;
    Ok(())
}

pub async fn insert_lote(
    db: &Db,
    id: i64,
    producer: &str,
    metadata_uri: &str,
    mint_tx_hash: Option<&str>,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "insert into lotes (id, producer, metadata_uri, mint_tx_hash) values (?, ?, ?, ?)",
    )
    .bind(id)
    .bind(producer)
    .bind(metadata_uri)
    .bind(mint_tx_hash)
    .execute(db)
    .await?;
    Ok(())
}

pub async fn get_lote(db: &Db, id: i64) -> Result<Option<LoteRow>, sqlx::Error> {
    sqlx::query_as::<_, LoteRow>(
        "select id, producer, metadata_uri, tier, status, mint_tx_hash from lotes where id = ?",
    )
    .bind(id)
    .fetch_optional(db)
    .await
}

pub async fn list_lotes(db: &Db) -> Result<Vec<LoteRow>, sqlx::Error> {
    sqlx::query_as::<_, LoteRow>(
        "select id, producer, metadata_uri, tier, status, mint_tx_hash from lotes order by id desc",
    )
    .fetch_all(db)
    .await
}

#[allow(clippy::too_many_arguments)]
pub async fn insert_event(
    db: &Db,
    lote_id: i64,
    idx: i64,
    stage: &str,
    actor: &str,
    payload: &str,
    hash: &str,
    onchain_tx_hash: Option<&str>,
    onchain_status: &str,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "insert into events (lote_id, idx, stage, actor, payload, hash, onchain_tx_hash, onchain_status)
         values (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(lote_id)
    .bind(idx)
    .bind(stage)
    .bind(actor)
    .bind(payload)
    .bind(hash)
    .bind(onchain_tx_hash)
    .bind(onchain_status)
    .execute(db)
    .await?;
    Ok(())
}

pub async fn get_events(db: &Db, lote_id: i64) -> Result<Vec<EventRow>, sqlx::Error> {
    sqlx::query_as::<_, EventRow>(
        "select idx, stage, actor, payload, hash, onchain_tx_hash, onchain_status, created_at
         from events where lote_id = ? order by idx asc",
    )
    .bind(lote_id)
    .fetch_all(db)
    .await
}

pub async fn update_tier(db: &Db, lote_id: i64, tier: &str) -> Result<(), sqlx::Error> {
    sqlx::query("update lotes set tier = ? where id = ?")
        .bind(tier)
        .bind(lote_id)
        .execute(db)
        .await?;
    Ok(())
}

// ---- Actores ----

pub async fn get_actor_by_email(db: &Db, email: &str) -> Result<Option<ActorRow>, sqlx::Error> {
    sqlx::query_as::<_, ActorRow>(
        "select id, kind, name, email from actors where email = ? limit 1",
    )
    .bind(email)
    .fetch_optional(db)
    .await
}

pub async fn list_actors(db: &Db) -> Result<Vec<ActorRow>, sqlx::Error> {
    sqlx::query_as::<_, ActorRow>("select id, kind, name, email from actors order by kind, name")
        .fetch_all(db)
        .await
}

pub async fn upsert_actor(
    db: &Db,
    id: &str,
    kind: &str,
    name: &str,
    email: Option<&str>,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "insert into actors (id, kind, name, email) values (?, ?, ?, ?)
         on conflict(id) do update set kind = excluded.kind, name = excluded.name",
    )
    .bind(id)
    .bind(kind)
    .bind(name)
    .bind(email)
    .execute(db)
    .await?;
    Ok(())
}

pub async fn insert_certification(
    db: &Db,
    lote_id: i64,
    tier: &str,
    tx_hash: Option<&str>,
) -> Result<(), sqlx::Error> {
    sqlx::query("insert into certifications (lote_id, tier, tx_hash) values (?, ?, ?)")
        .bind(lote_id)
        .bind(tier)
        .bind(tx_hash)
        .execute(db)
        .await?;
    Ok(())
}
