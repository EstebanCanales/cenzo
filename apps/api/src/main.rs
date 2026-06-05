mod auth;
mod config;
mod db;
mod error;
mod hashing;
mod models;
mod roles;
mod routes;
mod stellar;

use std::sync::Arc;

use config::Config;
use routes::AppState;
use stellar::Stellar;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Carga .env desde el directorio del crate (robusto ante el CWD de `cargo run`).
    match dotenvy::from_filename(concat!(env!("CARGO_MANIFEST_DIR"), "/.env")) {
        Ok(p) => eprintln!("[censo-api] .env cargado: {}", p.display()),
        Err(e) => eprintln!("[censo-api] no se cargó .env: {e}"),
    }
    dotenvy::dotenv().ok();

    let config = Config::from_env()?;

    let db = db::connect(&config.database_url).await?;
    db::init_schema(&db).await?;

    let stellar = Stellar::new(
        config.contract_id.clone(),
        config.key_name.clone(),
        config.network.clone(),
    );

    let state = AppState {
        db,
        stellar: Arc::new(stellar),
        config: Arc::new(config.clone()),
    };

    let addr = format!("127.0.0.1:{}", config.api_port);
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    println!("[censo-api] escuchando en http://{addr}");
    axum::serve(listener, routes::router(state)).await?;
    Ok(())
}
