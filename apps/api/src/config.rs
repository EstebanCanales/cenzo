use anyhow::Context;

/// Configuración del backend, cargada desde el entorno (`apps/api/.env`).
#[derive(Clone)]
pub struct Config {
    pub database_url: String,
    pub contract_id: String,
    pub key_name: String,
    pub network: String,
    pub api_port: u16,
    /// Secreto compartido server-a-server. El proxy Next.js lo adjunta en
    /// `x-api-key` para las rutas de escritura. Vacío = sin gate (solo dev).
    pub api_shared_secret: String,
}

impl Config {
    pub fn from_env() -> anyhow::Result<Self> {
        Ok(Self {
            database_url: req("DATABASE_URL")?,
            contract_id: req("CENSO_CONTRACT_ID")?,
            key_name: req("ADMIN_KEY_NAME")?,
            network: std::env::var("STELLAR_NETWORK").unwrap_or_else(|_| "testnet".into()),
            api_port: std::env::var("API_PORT")
                .ok()
                .and_then(|s| s.parse().ok())
                .unwrap_or(4000),
            api_shared_secret: std::env::var("API_SHARED_SECRET").unwrap_or_default(),
        })
    }
}

fn req(key: &str) -> anyhow::Result<String> {
    std::env::var(key).with_context(|| format!("falta variable de entorno {key}"))
}
