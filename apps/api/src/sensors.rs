use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::error::AppError;

// ── NASA POWER ─────────────────────────────────────────────────────────────
// API pública, sin key. Documentación: https://power.larc.nasa.gov/api/
// Parámetros usados: T2M_MAX, T2M_MIN, PRECTOTCORR, RH2M — diario.

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NasaDay {
    pub date: String,       // YYYYMMDD
    pub t2m_max: f64,
    pub t2m_min: f64,
    pub prectotcorr: f64,
    pub rh2m: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClimateResponse {
    pub lat: f64,
    pub lon: f64,
    pub days: Vec<NasaDay>,
}

pub async fn fetch_nasa_climate(lat: f64, lon: f64, days: u8) -> Result<ClimateResponse, AppError> {
    let end_date = chrono::Utc::now();
    let start_date = end_date - chrono::Duration::days(days as i64);
    let start_str = start_date.format("%Y%m%d").to_string();
    let end_str = end_date.format("%Y%m%d").to_string();

    let url = format!(
        "https://power.larc.nasa.gov/api/temporal/daily/point\
         ?parameters=T2M_MAX,T2M_MIN,PRECTOTCORR,RH2M\
         &community=AG\
         &longitude={lon}\
         &latitude={lat}\
         &start={start_str}\
         &end={end_str}\
         &format=JSON"
    );

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(15))
        .build()
        .map_err(|e| AppError::Internal(anyhow::anyhow!("http client: {e}")))?;

    let resp = client
        .get(&url)
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("nasa fetch: {e}")))?;

    if !resp.status().is_success() {
        return Err(AppError::Internal(anyhow::anyhow!(
            "nasa api status {}",
            resp.status()
        )));
    }

    let body: Value = resp
        .json()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("nasa parse: {e}")))?;

    parse_nasa_response(lat, lon, &body)
}

fn parse_nasa_response(lat: f64, lon: f64, body: &Value) -> Result<ClimateResponse, AppError> {
    let params = body
        .pointer("/properties/parameter")
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("nasa: no parameter field")))?;

    let t2m_max = params.get("T2M_MAX").and_then(|v| v.as_object()).cloned().unwrap_or_default();
    let t2m_min = params.get("T2M_MIN").and_then(|v| v.as_object()).cloned().unwrap_or_default();
    let prec    = params.get("PRECTOTCORR").and_then(|v| v.as_object()).cloned().unwrap_or_default();
    let rh      = params.get("RH2M").and_then(|v| v.as_object()).cloned().unwrap_or_default();

    let mut dates: Vec<String> = t2m_max.keys().cloned().collect();
    dates.sort();

    let days = dates
        .into_iter()
        .map(|d| NasaDay {
            date: d.clone(),
            t2m_max:     t2m_max.get(&d).and_then(|v| v.as_f64()).unwrap_or(-999.0),
            t2m_min:     t2m_min.get(&d).and_then(|v| v.as_f64()).unwrap_or(-999.0),
            prectotcorr: prec.get(&d).and_then(|v| v.as_f64()).unwrap_or(0.0),
            rh2m:        rh.get(&d).and_then(|v| v.as_f64()).unwrap_or(0.0),
        })
        .filter(|d| d.t2m_max > -900.0) // filtrar fill values de NASA
        .collect();

    Ok(ClimateResponse { lat, lon, days })
}

// ── Sensores IoT simulados ──────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SensorReading {
    pub station_id: String,
    pub lote_id: Option<i64>,
    pub temp_aire: Option<f64>,
    pub humedad: Option<f64>,
    pub temp_suelo: Option<f64>,
    pub ph_suelo: Option<f64>,
    pub lluvia_mm: Option<f64>,
    pub lat: Option<f64>,
    pub lon: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct SensorReadingView {
    pub id: i64,
    pub station_id: String,
    pub lote_id: Option<i64>,
    pub temp_aire: Option<f64>,
    pub humedad: Option<f64>,
    pub temp_suelo: Option<f64>,
    pub ph_suelo: Option<f64>,
    pub lluvia_mm: Option<f64>,
    pub lat: Option<f64>,
    pub lon: Option<f64>,
    pub recorded_at: String,
}

// Genera lecturas simuladas realistas para demo / test
pub fn simulate_readings(station_id: &str, lote_id: Option<i64>) -> SensorReading {
    use std::time::{SystemTime, UNIX_EPOCH};
    let seed = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .subsec_nanos() as f64;
    let jitter = (seed % 1000.0) / 1000.0; // 0..1

    SensorReading {
        station_id: station_id.to_string(),
        lote_id,
        temp_aire:  Some(18.0 + jitter * 10.0),   // 18–28 °C
        humedad:    Some(55.0 + jitter * 35.0),    // 55–90 %
        temp_suelo: Some(16.0 + jitter * 8.0),     // 16–24 °C
        ph_suelo:   Some(5.5 + jitter * 2.0),      // 5.5–7.5
        lluvia_mm:  Some((jitter * 8.0).round()),   // 0–8 mm
        lat: Some(9.9281),   // coordenadas demo (Costa Rica central)
        lon: Some(-84.0907),
    }
}
