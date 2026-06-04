use serde_json::Value;
use sha2::{Digest, Sha256};

/// Serializa un JSON de forma canónica y determinista: claves de objeto
/// ordenadas alfabéticamente y sin espacios insignificantes. Misma entrada →
/// misma cadena → mismo hash, en write y en read (clave para detectar
/// manipulación del dato off-chain).
pub fn canonical_json(value: &Value) -> String {
    let mut out = String::new();
    write_canonical(value, &mut out);
    out
}

fn write_canonical(value: &Value, out: &mut String) {
    match value {
        Value::Object(map) => {
            let mut keys: Vec<&String> = map.keys().collect();
            keys.sort();
            out.push('{');
            for (i, k) in keys.iter().enumerate() {
                if i > 0 {
                    out.push(',');
                }
                out.push_str(&serde_json::to_string(k).expect("key serializable"));
                out.push(':');
                write_canonical(&map[*k], out);
            }
            out.push('}');
        }
        Value::Array(arr) => {
            out.push('[');
            for (i, e) in arr.iter().enumerate() {
                if i > 0 {
                    out.push(',');
                }
                write_canonical(e, out);
            }
            out.push(']');
        }
        scalar => out.push_str(&serde_json::to_string(scalar).expect("scalar serializable")),
    }
}

/// sha256 en hex (lo que se ancla on-chain como `BytesN<32>`).
pub fn sha256_hex(input: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    hex::encode(hasher.finalize())
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn canonical_is_key_order_independent() {
        let a = json!({ "b": 1, "a": 2, "nested": { "y": 1, "x": 2 } });
        let b = json!({ "nested": { "x": 2, "y": 1 }, "a": 2, "b": 1 });
        assert_eq!(canonical_json(&a), canonical_json(&b));
        assert_eq!(sha256_hex(&canonical_json(&a)), sha256_hex(&canonical_json(&b)));
    }

    #[test]
    fn canonical_detects_value_change() {
        let a = json!({ "detalle": "siembra" });
        let b = json!({ "detalle": "tueste" });
        assert_ne!(sha256_hex(&canonical_json(&a)), sha256_hex(&canonical_json(&b)));
    }

    #[test]
    fn sha256_matches_known_vector() {
        // sha256("") = e3b0c442...
        assert_eq!(
            sha256_hex(""),
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        );
    }
}
