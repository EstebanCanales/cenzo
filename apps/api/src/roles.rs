//! Roles de actor y las etapas (stages) que cada uno puede registrar.
//! Modela el flujo real del café: la finca origina y cultiva, el tostador
//! procesa, el vendedor cierra. `admin` puede todo.

pub const ROLES: [&str; 4] = ["finca", "tostador", "vendedor", "admin"];

/// Etapas permitidas por rol. `admin` devuelve vacío = sin restricción.
pub fn allowed_stages(kind: &str) -> &'static [&'static str] {
    match kind {
        "finca" => &["siembra", "fertiliza", "riego", "cosecha"],
        "tostador" => &["recepcion", "tueste", "empaque"],
        "vendedor" => &["calidad", "venta"],
        _ => &[],
    }
}

pub fn is_role(kind: &str) -> bool {
    ROLES.contains(&kind)
}

/// ¿Puede este rol registrar esta etapa?
pub fn stage_allowed(kind: &str, stage: &str) -> bool {
    if kind == "admin" {
        return true;
    }
    allowed_stages(kind).contains(&stage)
}

/// ¿Puede este rol originar (mintear) un lote? La finca es el origen.
pub fn can_mint(kind: &str) -> bool {
    kind == "finca" || kind == "admin"
}
