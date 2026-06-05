/// Algoritmo de score del NFT por lote.
///
/// El score representa el estado verificable del producto para el agricultor:
/// un número que compradores y certificadores pueden auditar porque cada
/// componente viene de datos anclados on-chain o de sensores firmados.
///
/// Componentes (total 100 pts):
///   Trazabilidad   40 pts — etapas del ciclo presentes y en orden
///   Integridad     25 pts — hashes on-chain verificados sin manipulación
///   Sensores       20 pts — lecturas IoT dentro de rangos óptimos
///   Certificación  15 pts — tier otorgado por evaluación objetiva
///
/// Grado final: A (≥88), B (≥72), C (≥55), D (≥38), F (<38)

use serde::Serialize;

use crate::sensors::SensorReadingView;

// ── Tipos ─────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize)]
pub struct NftScore {
    pub total: u8,
    pub grade: &'static str,
    pub grade_label: &'static str,
    pub breakdown: Breakdown,
    pub traits: Vec<NftTrait>,
    pub summary: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct Breakdown {
    pub trazabilidad: Component,
    pub integridad:   Component,
    pub sensores:     Component,
    pub certificacion: Component,
}

#[derive(Debug, Clone, Serialize)]
pub struct Component {
    pub score: u8,
    pub max:   u8,
    pub label: String,
    pub detail: String,
}

/// Atributo ERC-style para el NFT metadata
#[derive(Debug, Clone, Serialize)]
pub struct NftTrait {
    pub trait_type: String,
    pub value: String,
    pub display_type: Option<&'static str>,
}

// ── Entradas del algoritmo ────────────────────────────────────────────────

pub struct ScoreInput<'a> {
    pub tier:       &'a str,            // "None" | "Plata" | "Oro" | "Diamante"
    pub events:     &'a [EventSnap],    // resumen de eventos
    pub readings:   &'a [SensorReadingView],
}

/// Vista mínima de evento que necesita el algoritmo
pub struct EventSnap {
    pub stage:       String,
    pub verified:    bool,   // hash on-chain coincide
}

// ── Constantes de rangos óptimos de sensores ──────────────────────────────

const TEMP_AIRE_MIN: f64  = 15.0;
const TEMP_AIRE_MAX: f64  = 28.0;
const HUMEDAD_MIN:   f64  = 55.0;
const HUMEDAD_MAX:   f64  = 92.0;
const PH_MIN:        f64  = 5.2;
const PH_MAX:        f64  = 7.2;
const TEMP_SUELO_MIN: f64 = 14.0;
const TEMP_SUELO_MAX: f64 = 26.0;

// Etapas del ciclo completo de café finca→venta
const CICLO_COMPLETO: &[&str] = &[
    "siembra", "cosecha",            // finca
    "recepcion", "tueste", "empaque", // tostador
    "calidad", "venta",              // vendedor
];

// Etapas mínimas para considerar trazabilidad base
const CICLO_MINIMO: &[&str] = &["siembra", "cosecha", "recepcion", "venta"];

// ── Algoritmo principal ───────────────────────────────────────────────────

pub fn compute(input: &ScoreInput<'_>) -> NftScore {
    let traz  = score_trazabilidad(input.events);
    let integ = score_integridad(input.events);
    let sens  = score_sensores(input.readings);
    let cert  = score_certificacion(input.tier);

    let total = (traz.score + integ.score + sens.score + cert.score).min(100);
    let (grade, grade_label) = classify(total);

    let traits = build_traits(input, total, grade, &traz, &integ, &sens, &cert);
    let summary = build_summary(total, grade, input.events.len(), input.tier);

    NftScore {
        total,
        grade,
        grade_label,
        breakdown: Breakdown {
            trazabilidad:  traz,
            integridad:    integ,
            sensores:      sens,
            certificacion: cert,
        },
        traits,
        summary,
    }
}

// ── Componente 1: Trazabilidad (max 40) ──────────────────────────────────

fn score_trazabilidad(events: &[EventSnap]) -> Component {
    if events.is_empty() {
        return Component { score: 0, max: 40, label: "Sin eventos".into(), detail: "No se ha registrado ninguna etapa del producto.".into() };
    }

    let stages: Vec<&str> = events.iter().map(|e| e.stage.as_str()).collect();

    // etapas mínimas presentes
    let min_present = CICLO_MINIMO.iter().filter(|s| stages.contains(s)).count();
    // etapas completas presentes
    let full_present = CICLO_COMPLETO.iter().filter(|s| stages.contains(s)).count();

    // base: 5 pts por etapa mínima (max 20 con 4 etapas)
    let base = (min_present as u8) * 5;
    // bonus: 3 pts por etapa adicional del ciclo completo (max 21 con 7 etapas)
    let bonus = ((full_present.saturating_sub(min_present)) as u8) * 3;
    // extra: 4 pts si tiene ≥7 etapas (ciclo completo)
    let extra: u8 = if full_present >= 7 { 4 } else { 0 };

    let score = (base + bonus + extra).min(40);

    let label = match score {
        35..=40 => "Ciclo completo",
        20..=34 => "Trazabilidad parcial",
        1..=19  => "Trazabilidad básica",
        _       => "Sin trazabilidad",
    };

    Component {
        score,
        max: 40,
        label: label.into(),
        detail: format!(
            "{} de {} etapas del ciclo registradas ({} mínimas, {} completas).",
            stages.len(), CICLO_COMPLETO.len(), min_present, full_present
        ),
    }
}

// ── Componente 2: Integridad on-chain (max 25) ───────────────────────────

fn score_integridad(events: &[EventSnap]) -> Component {
    if events.is_empty() {
        return Component { score: 0, max: 25, label: "Sin eventos".into(), detail: "No hay eventos que verificar.".into() };
    }

    let total = events.len();
    let verified = events.iter().filter(|e| e.verified).count();
    let ratio = verified as f64 / total as f64;

    // Score proporcional: 100% → 25, 80% → 20, <50% → castigo
    let score: u8 = if ratio >= 1.0 {
        25
    } else if ratio >= 0.8 {
        20
    } else if ratio >= 0.6 {
        14
    } else if ratio >= 0.4 {
        8
    } else {
        3
    };

    let label = if verified == total {
        "Todos verificados"
    } else if verified == 0 {
        "Sin verificar"
    } else {
        "Parcialmente verificado"
    };

    Component {
        score,
        max: 25,
        label: label.into(),
        detail: format!("{verified}/{total} eventos verificados on-chain ({:.0}%).", ratio * 100.0),
    }
}

// ── Componente 3: Sensores IoT (max 20) ──────────────────────────────────

fn score_sensores(readings: &[SensorReadingView]) -> Component {
    if readings.is_empty() {
        return Component { score: 5, max: 20, label: "Sin lecturas".into(), detail: "No hay datos de sensores. Score base aplicado.".into() };
    }

    // Promediamos las últimas 5 lecturas
    let sample: &[SensorReadingView] = &readings[..readings.len().min(5)];
    let n = sample.len() as f64;

    let avg_temp_aire  = avg_opt(sample.iter().filter_map(|r| r.temp_aire));
    let avg_humedad    = avg_opt(sample.iter().filter_map(|r| r.humedad));
    let avg_ph         = avg_opt(sample.iter().filter_map(|r| r.ph_suelo));
    let avg_temp_suelo = avg_opt(sample.iter().filter_map(|r| r.temp_suelo));

    let _ = n; // ya usado implícitamente en avg_opt

    // Cada métrica aporta hasta 5 pts
    let pts_temp_aire  = range_score(avg_temp_aire,  TEMP_AIRE_MIN,  TEMP_AIRE_MAX,  5);
    let pts_humedad    = range_score(avg_humedad,    HUMEDAD_MIN,    HUMEDAD_MAX,    5);
    let pts_ph         = range_score(avg_ph,         PH_MIN,         PH_MAX,         5);
    let pts_temp_suelo = range_score(avg_temp_suelo, TEMP_SUELO_MIN, TEMP_SUELO_MAX, 5);

    let score = (pts_temp_aire + pts_humedad + pts_ph + pts_temp_suelo).min(20);

    let label = match score {
        17..=20 => "Condiciones óptimas",
        12..=16 => "Condiciones buenas",
        7..=11  => "Condiciones regulares",
        _       => "Condiciones críticas",
    };

    let issues: Vec<&str> = {
        let mut v = vec![];
        if pts_temp_aire < 3 { v.push("Tª aire fuera de rango") }
        if pts_humedad   < 3 { v.push("Humedad fuera de rango") }
        if pts_ph        < 3 { v.push("pH fuera de rango") }
        if pts_temp_suelo < 3 { v.push("Tª suelo fuera de rango") }
        v
    };

    let detail = if issues.is_empty() {
        format!("Todos los parámetros en rango óptimo ({} lecturas analizadas).", sample.len())
    } else {
        format!("{} ({} lecturas). Alertas: {}.", label, sample.len(), issues.join(", "))
    };

    Component { score, max: 20, label: label.into(), detail }
}

fn avg_opt(iter: impl Iterator<Item = f64>) -> Option<f64> {
    let (sum, count) = iter.fold((0.0f64, 0usize), |(s, c), v| (s + v, c + 1));
    if count == 0 { None } else { Some(sum / count as f64) }
}

fn range_score(val: Option<f64>, min: f64, max: f64, max_pts: u8) -> u8 {
    match val {
        None => max_pts / 2, // sin dato → score neutro
        Some(v) if v >= min && v <= max => max_pts,
        Some(v) => {
            // degradación proporcional: cuanto más lejos del rango, menos pts
            let dist = if v < min { min - v } else { v - max };
            let range = max - min;
            let penalty = (dist / (range * 0.5)).min(1.0);
            ((max_pts as f64 * (1.0 - penalty)).round() as u8).max(1)
        }
    }
}

// ── Componente 4: Certificación (max 15) ─────────────────────────────────

fn score_certificacion(tier: &str) -> Component {
    let (score, label, detail) = match tier {
        "Diamante" => (15, "Certificación Diamante", "Cumple todos los criterios: origen, proceso completo, prácticas sostenibles e integridad total."),
        "Oro"      => (11, "Certificación Oro",      "Cumple criterios de origen, proceso y venta verificados."),
        "Plata"    => (7,  "Certificación Plata",    "Certificación base: origen e integridad mínima verificados."),
        _          => (0,  "Sin certificación",      "No se ha aplicado certificación on-chain al lote."),
    };
    Component { score, max: 15, label: label.into(), detail: detail.into() }
}

// ── Clasificación final ───────────────────────────────────────────────────

fn classify(total: u8) -> (&'static str, &'static str) {
    match total {
        88..=100 => ("A", "Producto excelente"),
        72..=87  => ("B", "Producto bueno"),
        55..=71  => ("C", "Producto aceptable"),
        38..=54  => ("D", "Producto en desarrollo"),
        _        => ("F", "No verificable"),
    }
}

// ── Traits del NFT (para metadata on-chain) ──────────────────────────────

fn build_traits(
    input: &ScoreInput<'_>,
    total: u8,
    grade: &str,
    traz: &Component,
    integ: &Component,
    sens: &Component,
    cert: &Component,
) -> Vec<NftTrait> {
    let stages: Vec<&str> = input.events.iter().map(|e| e.stage.as_str()).collect();
    let verified_count = input.events.iter().filter(|e| e.verified).count();

    vec![
        NftTrait { trait_type: "Score".into(),         value: total.to_string(),            display_type: Some("number") },
        NftTrait { trait_type: "Grado".into(),         value: grade.to_string(),            display_type: None },
        NftTrait { trait_type: "Tier".into(),          value: input.tier.to_string(),       display_type: None },
        NftTrait { trait_type: "Trazabilidad".into(),  value: traz.label.clone(),           display_type: None },
        NftTrait { trait_type: "Integridad".into(),    value: integ.label.clone(),          display_type: None },
        NftTrait { trait_type: "Sensores".into(),      value: sens.label.clone(),           display_type: None },
        NftTrait { trait_type: "Certificacion".into(), value: cert.label.clone(),           display_type: None },
        NftTrait { trait_type: "Etapas".into(),        value: stages.len().to_string(),     display_type: Some("number") },
        NftTrait { trait_type: "Verificados".into(),   value: verified_count.to_string(),   display_type: Some("number") },
    ]
}

fn build_summary(total: u8, grade: &str, event_count: usize, tier: &str) -> String {
    format!(
        "Score {total}/100 (Grado {grade}). {} eventos registrados. Tier: {tier}.",
        event_count
    )
}

// ── Tests ─────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use crate::sensors::SensorReadingView;

    fn reading(temp_aire: f64, humedad: f64, ph: f64, temp_suelo: f64) -> SensorReadingView {
        SensorReadingView {
            id: 1, station_id: "test".into(), lote_id: None,
            temp_aire: Some(temp_aire), humedad: Some(humedad),
            temp_suelo: Some(temp_suelo), ph_suelo: Some(ph),
            lluvia_mm: Some(0.0), lat: None, lon: None,
            recorded_at: "2026-01-01 00:00:00".into(),
        }
    }

    fn event(stage: &str, verified: bool) -> EventSnap {
        EventSnap { stage: stage.into(), verified }
    }

    #[test]
    fn score_diamante_completo() {
        let events: Vec<EventSnap> = CICLO_COMPLETO.iter()
            .map(|s| event(s, true))
            .collect();
        let readings = vec![reading(22.0, 75.0, 6.2, 20.0)];
        let input = ScoreInput { tier: "Diamante", events: &events, readings: &readings };
        let s = compute(&input);
        assert_eq!(s.grade, "A");
        assert!(s.total >= 88, "Esperado ≥88, got {}", s.total);
    }

    #[test]
    fn score_sin_datos() {
        let input = ScoreInput { tier: "None", events: &[], readings: &[] };
        let s = compute(&input);
        assert_eq!(s.grade, "F");
        assert!(s.total < 38, "got {}", s.total);
    }

    #[test]
    fn score_sensores_fuera_de_rango() {
        let events = vec![event("siembra", true), event("cosecha", true)];
        // pH y temperatura extremos
        let readings = vec![reading(35.0, 20.0, 9.5, 35.0)];
        let input = ScoreInput { tier: "Plata", events: &events, readings: &readings };
        let s = compute(&input);
        // sensores bajos pero trazabilidad y cert suman algo
        assert!(s.breakdown.sensores.score < 8);
    }

    #[test]
    fn traits_tienen_score_correcto() {
        let events = vec![event("siembra", true), event("cosecha", false)];
        let input = ScoreInput { tier: "Plata", events: &events, readings: &[] };
        let s = compute(&input);
        let score_trait = s.traits.iter().find(|t| t.trait_type == "Score").unwrap();
        assert_eq!(score_trait.value, s.total.to_string());
    }
}
