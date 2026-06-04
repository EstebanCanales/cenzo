use serde::{Deserialize, Serialize};
use serde_json::Value;

// ---- Requests ----

#[derive(Deserialize)]
pub struct CreateLoteReq {
    pub producer: String,
    pub metadata_uri: Option<String>,
}

#[derive(Deserialize)]
pub struct AddEventReq {
    pub stage: String,
    pub actor: String,
    pub payload: Value,
}

#[derive(Deserialize)]
pub struct SetCertReq {
    /// "Plata" | "Oro" | "Diamante"
    pub tier: String,
}

// ---- Responses ----

#[derive(Serialize)]
pub struct CreateLoteResp {
    pub id: i64,
    pub mint_tx_hash: Option<String>,
}

#[derive(Serialize)]
pub struct AddEventResp {
    pub idx: i64,
    pub hash: String,
    pub onchain_tx_hash: Option<String>,
}

#[derive(Serialize)]
pub struct OkResp {
    pub ok: bool,
    pub tx_hash: Option<String>,
}

#[derive(Serialize)]
pub struct LoteSummary {
    pub id: i64,
    pub producer: String,
    pub tier: String,
    pub status: String,
    pub mint_tx_hash: Option<String>,
}

#[derive(Serialize)]
pub struct EventView {
    pub idx: i64,
    pub stage: String,
    pub actor: String,
    pub payload: Value,
    pub hash: String,
    pub onchain_tx_hash: Option<String>,
    /// "verified" | "tampered" | "pending"
    pub verification: String,
    pub created_at: String,
}

#[derive(Serialize)]
pub struct LoteView {
    pub id: i64,
    pub producer: String,
    pub metadata_uri: String,
    pub tier: String,
    pub status: String,
    pub mint_tx_hash: Option<String>,
    pub event_count: i64,
    /// true si todos los eventos verifican contra el hash on-chain.
    pub onchain_verified: bool,
    pub events: Vec<EventView>,
}
