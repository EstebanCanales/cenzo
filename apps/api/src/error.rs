use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

/// Error de aplicación con mapeo a respuesta HTTP.
pub enum AppError {
    NotFound(String),
    BadRequest(String),
    Unauthorized,
    Internal(anyhow::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, msg) = match self {
            AppError::NotFound(m) => (StatusCode::NOT_FOUND, m),
            AppError::BadRequest(m) => (StatusCode::BAD_REQUEST, m),
            AppError::Unauthorized => (StatusCode::UNAUTHORIZED, "no autorizado".to_string()),
            AppError::Internal(e) => {
                eprintln!("[censo-api] error interno: {e:?}");
                (StatusCode::INTERNAL_SERVER_ERROR, "error interno".to_string())
            }
        };
        (status, Json(json!({ "error": msg }))).into_response()
    }
}

// Conversiones explícitas para habilitar `?` (un blanket sobre `Into<anyhow>`
// chocaría con la impl reflexiva `From<T> for T` de std).
impl From<anyhow::Error> for AppError {
    fn from(e: anyhow::Error) -> Self {
        AppError::Internal(e)
    }
}

impl From<sqlx::Error> for AppError {
    fn from(e: sqlx::Error) -> Self {
        AppError::Internal(e.into())
    }
}
