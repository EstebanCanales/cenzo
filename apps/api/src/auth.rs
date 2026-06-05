use axum::http::HeaderMap;

use crate::error::AppError;

/// Gate server-a-server para rutas de escritura. El proxy Next.js (que ya
/// validó la sesión Google del usuario) adjunta `x-api-key`. Si el secreto no
/// está configurado, se permite (modo dev).
pub fn check_api_key(headers: &HeaderMap, expected: &str) -> Result<(), AppError> {
    if expected.is_empty() {
        return Ok(());
    }
    let provided = headers.get("x-api-key").and_then(|v| v.to_str().ok());
    match provided {
        Some(key) if key == expected => Ok(()),
        _ => Err(AppError::Unauthorized),
    }
}
