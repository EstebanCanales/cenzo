//! Rubro de certificación (Fase 4). Deriva el tier diamante/oro/plata desde
//! métricas objetivas y verificables del lote, en vez de fijarlo a mano.

use serde_json::Value;

use crate::models::{Criterion, Evaluation};

/// Claves de payload que cuentan como práctica sostenible documentada.
const PRACTICE_KEYS: [&str; 6] = [
    "organico",
    "regenerativo",
    "comercio_justo",
    "sin_agroquimicos",
    "sombra",
    "carbono_neutral",
];

pub struct EventEval<'a> {
    pub stage: &'a str,
    pub payload: &'a Value,
    pub verified: bool,
}

fn crit(key: &str, label: &str, met: bool) -> Criterion {
    Criterion {
        key: key.to_string(),
        label: label.to_string(),
        met,
    }
}

fn truthy(v: &Value) -> bool {
    match v {
        Value::Bool(b) => *b,
        Value::String(s) => !s.is_empty() && s != "false" && s != "no",
        Value::Number(n) => n.as_f64().map(|f| f != 0.0).unwrap_or(false),
        Value::Array(a) => !a.is_empty(),
        _ => false,
    }
}

fn has_practice(payload: &Value) -> bool {
    let Some(obj) = payload.as_object() else {
        return false;
    };
    for key in PRACTICE_KEYS {
        if let Some(v) = obj.get(key) {
            if truthy(v) {
                return true;
            }
        }
    }
    if let Some(Value::Array(arr)) = obj.get("practicas") {
        return !arr.is_empty();
    }
    false
}

/// Evalúa el lote y devuelve el tier recomendado + el desglose de criterios.
pub fn evaluate(events: &[EventEval]) -> Evaluation {
    let has = |stage: &str| events.iter().any(|e| e.stage == stage);

    let origin = has("siembra");
    let harvest = has("cosecha");
    let roast = has("tueste");
    let sale = has("venta") || has("calidad");
    let integrity = !events.is_empty() && events.iter().all(|e| e.verified);
    let practice = events.iter().any(|e| has_practice(e.payload));

    let criteria = vec![
        crit("origen", "Origen registrado (siembra)", origin),
        crit("cosecha", "Cosecha registrada", harvest),
        crit("proceso", "Procesamiento / tueste registrado", roast),
        crit("venta", "Calidad o venta registrada", sale),
        crit("integridad", "Integridad on-chain (sin manipulación)", integrity),
        crit("practicas", "Prácticas sostenibles documentadas", practice),
    ];

    let recommended_tier = if !integrity || !origin {
        "None"
    } else if origin && harvest && roast && sale && practice {
        "Diamante"
    } else if origin && roast && (harvest || sale) {
        "Oro"
    } else {
        "Plata"
    };

    Evaluation {
        recommended_tier: recommended_tier.to_string(),
        criteria,
    }
}

/// Código on-chain del tier para `set_certification` (None=0..Diamante=3).
pub fn tier_to_code(tier: &str) -> u8 {
    match tier.to_lowercase().as_str() {
        "plata" => 1,
        "oro" => 2,
        "diamante" => 3,
        _ => 0,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn ev<'a>(stage: &'a str, payload: &'a Value, verified: bool) -> EventEval<'a> {
        EventEval {
            stage,
            payload,
            verified,
        }
    }

    #[test]
    fn empty_is_none() {
        assert_eq!(evaluate(&[]).recommended_tier, "None");
    }

    #[test]
    fn tampered_breaks_to_none() {
        let p = json!({});
        let events = [ev("siembra", &p, false)];
        assert_eq!(evaluate(&events).recommended_tier, "None");
    }

    #[test]
    fn origin_only_is_plata() {
        let p = json!({});
        let events = [ev("siembra", &p, true)];
        assert_eq!(evaluate(&events).recommended_tier, "Plata");
    }

    #[test]
    fn full_chain_with_practice_is_diamante() {
        let p = json!({});
        let practice = json!({ "organico": true });
        let events = [
            ev("siembra", &practice, true),
            ev("cosecha", &p, true),
            ev("tueste", &p, true),
            ev("venta", &p, true),
        ];
        assert_eq!(evaluate(&events).recommended_tier, "Diamante");
    }

    #[test]
    fn full_chain_without_practice_is_oro() {
        let p = json!({});
        let events = [
            ev("siembra", &p, true),
            ev("cosecha", &p, true),
            ev("tueste", &p, true),
            ev("venta", &p, true),
        ];
        assert_eq!(evaluate(&events).recommended_tier, "Oro");
    }

    #[test]
    fn tier_codes() {
        assert_eq!(tier_to_code("Diamante"), 3);
        assert_eq!(tier_to_code("Oro"), 2);
        assert_eq!(tier_to_code("Plata"), 1);
        assert_eq!(tier_to_code("None"), 0);
    }
}
