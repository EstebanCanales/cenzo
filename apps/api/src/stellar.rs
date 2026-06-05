use anyhow::{anyhow, bail, Context};
use serde_json::Value;
use tokio::process::Command;

/// Cliente Soroban para Fase 1: envuelve el CLI `stellar` (build/sign/submit
/// reales con la llave admin custodial). El boundary permite cambiar a un
/// cliente RPC nativo en Rust más adelante sin tocar las rutas.
pub struct Stellar {
    bin: String,
    contract_id: String,
    key_name: String,
    network: String,
}

struct InvokeOutput {
    stdout: String,
    tx_hash: Option<String>,
}

impl Stellar {
    pub fn new(contract_id: String, key_name: String, network: String) -> Self {
        let bin = std::env::var("STELLAR_BIN").unwrap_or_else(|_| "stellar".into());
        Self {
            bin,
            contract_id,
            key_name,
            network,
        }
    }

    async fn invoke(&self, args: &[&str]) -> anyhow::Result<InvokeOutput> {
        let mut cmd = Command::new(&self.bin);
        cmd.arg("contract")
            .arg("invoke")
            .arg("--id")
            .arg(&self.contract_id)
            .arg("--source")
            .arg(&self.key_name)
            .arg("--network")
            .arg(&self.network)
            .arg("--");
        for a in args {
            cmd.arg(a);
        }

        let out = cmd
            .output()
            .await
            .with_context(|| format!("no se pudo ejecutar `{}` (¿está en PATH?)", self.bin))?;

        let stdout = String::from_utf8_lossy(&out.stdout).trim().to_string();
        let stderr = String::from_utf8_lossy(&out.stderr).to_string();

        if !out.status.success() {
            bail!("invoke `{}` falló: {}", args.join(" "), stderr.trim());
        }

        Ok(InvokeOutput {
            stdout,
            tx_hash: parse_tx_hash(&stderr),
        })
    }

    /// `mint_lote` → (lote_id, tx_hash)
    pub async fn mint_lote(
        &self,
        producer: &str,
        metadata_uri: &str,
    ) -> anyhow::Result<(i64, Option<String>)> {
        let out = self
            .invoke(&[
                "mint_lote",
                "--producer",
                producer,
                "--metadata_uri",
                metadata_uri,
            ])
            .await?;
        let id: i64 = out
            .stdout
            .parse()
            .with_context(|| format!("mint_lote devolvió valor no numérico: {:?}", out.stdout))?;
        Ok((id, out.tx_hash))
    }

    /// `append_event` → (idx, tx_hash)
    pub async fn append_event(
        &self,
        lote_id: i64,
        stage: &str,
        actor: &str,
        event_hash_hex: &str,
    ) -> anyhow::Result<(i64, Option<String>)> {
        let lote = lote_id.to_string();
        let out = self
            .invoke(&[
                "append_event",
                "--lote_id",
                &lote,
                "--stage",
                stage,
                "--actor",
                actor,
                "--event_hash",
                event_hash_hex,
            ])
            .await?;
        let idx: i64 = out
            .stdout
            .parse()
            .with_context(|| format!("append_event devolvió valor no numérico: {:?}", out.stdout))?;
        Ok((idx, out.tx_hash))
    }

    /// `set_certification` (tier: 1=Plata 2=Oro 3=Diamante) → tx_hash
    pub async fn set_certification(
        &self,
        lote_id: i64,
        tier_code: u8,
    ) -> anyhow::Result<Option<String>> {
        let lote = lote_id.to_string();
        let tier = tier_code.to_string();
        let out = self
            .invoke(&["set_certification", "--lote_id", &lote, "--tier", &tier])
            .await?;
        Ok(out.tx_hash)
    }

    /// Lee los hashes de eventos on-chain, en orden de idx.
    pub async fn get_event_hashes(&self, lote_id: i64) -> anyhow::Result<Vec<String>> {
        let lote = lote_id.to_string();
        let out = self
            .invoke(&["get_events", "--lote_id", &lote])
            .await?;
        let value: Value = serde_json::from_str(&out.stdout)
            .with_context(|| format!("get_events JSON inválido: {:?}", out.stdout))?;
        let arr = value
            .as_array()
            .ok_or_else(|| anyhow!("get_events no devolvió un array"))?;
        let mut hashes = Vec::with_capacity(arr.len());
        for e in arr {
            let h = e
                .get("hash")
                .and_then(|h| h.as_str())
                .ok_or_else(|| anyhow!("evento on-chain sin campo hash"))?;
            hashes.push(h.to_string());
        }
        Ok(hashes)
    }
}

/// Extrae el hash de transacción del stderr del CLI (línea del explorer o
/// "Signing transaction: <hash>").
fn parse_tx_hash(stderr: &str) -> Option<String> {
    for marker in ["/tx/", "Signing transaction: "] {
        if let Some(pos) = stderr.find(marker) {
            let rest = &stderr[pos + marker.len()..];
            let hash: String = rest.chars().take_while(|c| c.is_ascii_hexdigit()).collect();
            if hash.len() == 64 {
                return Some(hash);
            }
        }
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_tx_hash_from_explorer_link() {
        let stderr = "ℹ️ Sending transaction…\n🔗 https://stellar.expert/explorer/testnet/tx/f9112f18e1d982aab58f1a0f3feb04906c2891d10ab4115caaba4deb0e27e06b\n✅ done";
        assert_eq!(
            parse_tx_hash(stderr).as_deref(),
            Some("f9112f18e1d982aab58f1a0f3feb04906c2891d10ab4115caaba4deb0e27e06b")
        );
    }

    #[test]
    fn returns_none_when_no_hash() {
        assert_eq!(parse_tx_hash("nada interesante aquí"), None);
    }
}
