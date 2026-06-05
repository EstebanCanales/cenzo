use std::sync::Arc;

use axum::{
    extract::{Path, State},
    http::HeaderMap,
    routing::{get, post},
    Json, Router,
};
use serde_json::{json, Value};

use crate::auth::check_api_key;
use crate::config::Config;
use crate::db::{self, ActorRow, Db};
use crate::error::AppError;
use crate::hashing::{canonical_json, sha256_hex};
use crate::models::*;
use crate::roles;
use crate::stellar::Stellar;

#[derive(Clone)]
pub struct AppState {
    pub db: Db,
    pub stellar: Arc<Stellar>,
    pub config: Arc<Config>,
}

pub fn router(state: AppState) -> Router {
    Router::new()
        .route("/health", get(health))
        .route("/actors", get(list_actors).post(create_actor))
        .route("/actors/me", get(get_me))
        .route("/lotes", get(list_lotes).post(create_lote))
        .route("/lotes/:id", get(get_lote))
        .route("/lotes/:id/events", post(add_event))
        .route("/lotes/:id/certification", post(set_cert))
        .route("/public/lotes/:id", get(get_lote))
        .with_state(state)
}

async fn health() -> Json<Value> {
    Json(json!({ "status": "ok", "service": "censo-api" }))
}

// ---- Actores / roles ----

fn actor_email(headers: &HeaderMap) -> Option<String> {
    headers
        .get("x-actor-email")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.trim().to_lowercase())
        .filter(|s| !s.is_empty())
}

/// Resuelve el actor que actúa (header `x-actor-email`); error si no existe.
async fn acting_actor(st: &AppState, headers: &HeaderMap) -> Result<ActorRow, AppError> {
    let email = actor_email(headers)
        .ok_or_else(|| AppError::BadRequest("falta x-actor-email".into()))?;
    db::get_actor_by_email(&st.db, &email)
        .await?
        .ok_or_else(|| AppError::Forbidden("registrate como actor primero".into()))
}

fn actor_view(a: ActorRow) -> ActorView {
    let stages = roles::allowed_stages(&a.kind)
        .iter()
        .map(|s| s.to_string())
        .collect();
    ActorView {
        id: a.id,
        kind: a.kind,
        name: a.name,
        email: a.email,
        allowed_stages: stages,
    }
}

async fn list_actors(
    State(st): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<Vec<ActorView>>, AppError> {
    check_api_key(&headers, &st.config.api_shared_secret)?;
    let rows = db::list_actors(&st.db).await?;
    Ok(Json(rows.into_iter().map(actor_view).collect()))
}

async fn create_actor(
    State(st): State<AppState>,
    headers: HeaderMap,
    Json(req): Json<CreateActorReq>,
) -> Result<Json<ActorView>, AppError> {
    check_api_key(&headers, &st.config.api_shared_secret)?;
    if !roles::is_role(&req.kind) {
        return Err(AppError::BadRequest(
            "rol inválido (finca|tostador|vendedor|admin)".into(),
        ));
    }
    if req.name.trim().is_empty() || req.email.trim().is_empty() {
        return Err(AppError::BadRequest("name y email requeridos".into()));
    }
    let id = req.email.trim().to_lowercase();
    db::upsert_actor(&st.db, &id, &req.kind, req.name.trim(), Some(&id)).await?;
    let row = db::get_actor_by_email(&st.db, &id)
        .await?
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("actor no encontrado tras crear")))?;
    Ok(Json(actor_view(row)))
}

async fn get_me(
    State(st): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<ActorView>, AppError> {
    check_api_key(&headers, &st.config.api_shared_secret)?;
    let email = actor_email(&headers)
        .ok_or_else(|| AppError::BadRequest("falta x-actor-email".into()))?;
    let actor = db::get_actor_by_email(&st.db, &email)
        .await?
        .ok_or_else(|| AppError::NotFound("sin actor registrado".into()))?;
    Ok(Json(actor_view(actor)))
}

async fn list_lotes(State(st): State<AppState>) -> Result<Json<Vec<LoteSummary>>, AppError> {
    let rows = db::list_lotes(&st.db).await?;
    let out = rows
        .into_iter()
        .map(|r| LoteSummary {
            id: r.id,
            producer: r.producer,
            tier: r.tier,
            status: r.status,
            mint_tx_hash: r.mint_tx_hash,
        })
        .collect();
    Ok(Json(out))
}

async fn create_lote(
    State(st): State<AppState>,
    headers: HeaderMap,
    Json(req): Json<CreateLoteReq>,
) -> Result<Json<CreateLoteResp>, AppError> {
    check_api_key(&headers, &st.config.api_shared_secret)?;
    let actor = acting_actor(&st, &headers).await?;
    if !roles::can_mint(&actor.kind) {
        return Err(AppError::Forbidden(format!(
            "el rol '{}' no puede originar lotes (solo finca o admin)",
            actor.kind
        )));
    }
    if req.producer.trim().is_empty() {
        return Err(AppError::BadRequest("producer requerido".into()));
    }
    let uri = req.metadata_uri.unwrap_or_default();

    let (id, tx) = st.stellar.mint_lote(&req.producer, &uri).await?;
    db::insert_lote(&st.db, id, &req.producer, &uri, tx.as_deref()).await?;

    Ok(Json(CreateLoteResp {
        id,
        mint_tx_hash: tx,
    }))
}

async fn add_event(
    State(st): State<AppState>,
    Path(id): Path<i64>,
    headers: HeaderMap,
    Json(req): Json<AddEventReq>,
) -> Result<Json<AddEventResp>, AppError> {
    check_api_key(&headers, &st.config.api_shared_secret)?;
    let actor = acting_actor(&st, &headers).await?;

    if db::get_lote(&st.db, id).await?.is_none() {
        return Err(AppError::NotFound(format!("lote {id} no existe")));
    }
    validate_symbol(&req.stage)?;
    if !roles::stage_allowed(&actor.kind, &req.stage) {
        return Err(AppError::Forbidden(format!(
            "la etapa '{}' no corresponde al rol '{}'",
            req.stage, actor.kind
        )));
    }

    // El actor on-chain se deriva del rol autenticado, no del request.
    let actor_id = format!("{}:{}", actor.kind, actor.name);
    let canonical = canonical_json(&req.payload);
    let hash = sha256_hex(&canonical);

    let (idx, tx) = st
        .stellar
        .append_event(id, &req.stage, &actor_id, &hash)
        .await?;

    db::insert_event(
        &st.db,
        id,
        idx,
        &req.stage,
        &actor_id,
        &canonical,
        &hash,
        tx.as_deref(),
        "anchored",
    )
    .await?;

    Ok(Json(AddEventResp {
        idx,
        hash,
        onchain_tx_hash: tx,
    }))
}

async fn set_cert(
    State(st): State<AppState>,
    Path(id): Path<i64>,
    headers: HeaderMap,
    Json(req): Json<SetCertReq>,
) -> Result<Json<OkResp>, AppError> {
    check_api_key(&headers, &st.config.api_shared_secret)?;

    if db::get_lote(&st.db, id).await?.is_none() {
        return Err(AppError::NotFound(format!("lote {id} no existe")));
    }
    let code = tier_code(&req.tier)
        .ok_or_else(|| AppError::BadRequest("tier inválido (Plata|Oro|Diamante)".into()))?;
    let tier = normalize_tier(&req.tier);

    let tx = st.stellar.set_certification(id, code).await?;
    db::update_tier(&st.db, id, &tier).await?;
    db::insert_certification(&st.db, id, &tier, tx.as_deref()).await?;

    Ok(Json(OkResp { ok: true, tx_hash: tx }))
}

async fn get_lote(
    State(st): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Json<LoteView>, AppError> {
    let lote = db::get_lote(&st.db, id)
        .await?
        .ok_or_else(|| AppError::NotFound(format!("lote {id} no existe")))?;
    let rows = db::get_events(&st.db, id).await?;

    // Hashes on-chain (best-effort: si la red falla, todo queda "pending").
    let onchain = st.stellar.get_event_hashes(id).await.unwrap_or_default();

    let mut events = Vec::with_capacity(rows.len());
    let mut all_verified = !rows.is_empty();

    for row in &rows {
        let parsed: Value = serde_json::from_str(&row.payload).unwrap_or(Value::Null);
        let recomputed = sha256_hex(&canonical_json(&parsed));

        let verification = match onchain.get(row.idx as usize) {
            None => "pending",
            Some(onchain_hash) if *onchain_hash == recomputed => "verified",
            Some(_) => "tampered",
        };
        if verification != "verified" {
            all_verified = false;
        }

        events.push(EventView {
            idx: row.idx,
            stage: row.stage.clone(),
            actor: row.actor.clone(),
            payload: parsed,
            hash: row.hash.clone(),
            onchain_tx_hash: row.onchain_tx_hash.clone(),
            verification: verification.to_string(),
            created_at: row.created_at.clone(),
        });
    }

    Ok(Json(LoteView {
        id: lote.id,
        producer: lote.producer,
        metadata_uri: lote.metadata_uri,
        tier: lote.tier,
        status: lote.status,
        mint_tx_hash: lote.mint_tx_hash,
        event_count: rows.len() as i64,
        onchain_verified: all_verified,
        events,
    }))
}

fn tier_code(tier: &str) -> Option<u8> {
    match tier.to_lowercase().as_str() {
        "plata" => Some(1),
        "oro" => Some(2),
        "diamante" => Some(3),
        _ => None,
    }
}

fn normalize_tier(tier: &str) -> String {
    match tier.to_lowercase().as_str() {
        "plata" => "Plata",
        "oro" => "Oro",
        "diamante" => "Diamante",
        _ => "None",
    }
    .to_string()
}

/// El `stage` se mapea a un `Symbol` Soroban: solo `[a-zA-Z0-9_]`, máx 32.
fn validate_symbol(s: &str) -> Result<(), AppError> {
    if s.is_empty() || s.len() > 32 || !s.chars().all(|c| c.is_ascii_alphanumeric() || c == '_') {
        return Err(AppError::BadRequest(
            "stage inválido: solo [a-zA-Z0-9_], máx 32 chars".into(),
        ));
    }
    Ok(())
}
