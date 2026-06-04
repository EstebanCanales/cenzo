#![no_std]
//! Censo Trace — registro de trazabilidad de café sobre Soroban.
//!
//! Cada lote es un NFT no-fungible que funciona a la vez como:
//!   - trazabilidad: acumula eventos hash-anclados (siembra → tueste → venta)
//!   - certificado: carga un tier (Plata / Oro / Diamante)
//!
//! Modelo hash-anchor híbrido: los datos ricos de cada evento viven off-chain;
//! on-chain solo se ancla el `sha256` del evento. Verificar = recalcular el hash
//! off-chain y compararlo con el que vive aquí.
//!
//! Custodia: el `admin` (llave del backend) es la única address autorizada a
//! escribir. Los actores (finca/tostador/vendedor) se identifican por un
//! `String` off-chain, no por wallet propia.

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, BytesN, Env,
    String, Symbol, Vec,
};

#[contracterror]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    LoteNotFound = 3,
    EventNotFound = 4,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Tier {
    None = 0,
    Plata = 1,
    Oro = 2,
    Diamante = 3,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Status {
    Active = 0,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Lote {
    pub owner: Address,
    pub producer: String,
    pub metadata_uri: String,
    pub tier: Tier,
    pub status: Status,
    pub event_count: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Event {
    pub stage: Symbol,
    pub actor: String,
    pub timestamp: u64,
    pub hash: BytesN<32>,
}

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Admin,
    LoteCount,
    Lote(u64),
    Event(u64, u32),
}

#[contract]
pub struct CensoTrace;

#[contractimpl]
impl CensoTrace {
    /// Fija el admin custodial una sola vez. Falla si ya está inicializado.
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::LoteCount, &0u64);
        Ok(())
    }

    /// Address admin actual.
    pub fn admin(env: Env) -> Result<Address, Error> {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)
    }

    /// Mintea un nuevo lote-NFT. Solo admin. Devuelve el `lote_id`.
    pub fn mint_lote(
        env: Env,
        producer: String,
        metadata_uri: String,
    ) -> Result<u64, Error> {
        let admin = Self::require_admin(&env)?;

        let count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::LoteCount)
            .unwrap_or(0);
        let lote_id = count + 1;

        let lote = Lote {
            owner: admin,
            producer,
            metadata_uri,
            tier: Tier::None,
            status: Status::Active,
            event_count: 0,
        };

        env.storage().persistent().set(&DataKey::Lote(lote_id), &lote);
        env.storage().instance().set(&DataKey::LoteCount, &lote_id);

        env.events()
            .publish((symbol_short!("mint"), lote_id), lote.producer.clone());

        Ok(lote_id)
    }

    /// Ancla el hash de un evento al lote. Solo admin. Devuelve el `idx` del evento.
    pub fn append_event(
        env: Env,
        lote_id: u64,
        stage: Symbol,
        actor: String,
        event_hash: BytesN<32>,
    ) -> Result<u32, Error> {
        Self::require_admin(&env)?;

        let mut lote = Self::load_lote(&env, lote_id)?;
        let idx = lote.event_count;

        let event = Event {
            stage: stage.clone(),
            actor,
            timestamp: env.ledger().timestamp(),
            hash: event_hash,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Event(lote_id, idx), &event);

        lote.event_count = idx + 1;
        env.storage().persistent().set(&DataKey::Lote(lote_id), &lote);

        env.events()
            .publish((symbol_short!("event"), lote_id, idx), stage);

        Ok(idx)
    }

    /// Fija el tier de certificación del lote. Solo admin.
    pub fn set_certification(env: Env, lote_id: u64, tier: Tier) -> Result<(), Error> {
        Self::require_admin(&env)?;

        let mut lote = Self::load_lote(&env, lote_id)?;
        lote.tier = tier;
        env.storage().persistent().set(&DataKey::Lote(lote_id), &lote);

        env.events()
            .publish((symbol_short!("cert"), lote_id), tier);

        Ok(())
    }

    /// Lee un lote por id.
    pub fn get_lote(env: Env, lote_id: u64) -> Result<Lote, Error> {
        Self::load_lote(&env, lote_id)
    }

    /// Lee un evento puntual.
    pub fn get_event(env: Env, lote_id: u64, idx: u32) -> Result<Event, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Event(lote_id, idx))
            .ok_or(Error::EventNotFound)
    }

    /// Lee todos los eventos de un lote en orden.
    pub fn get_events(env: Env, lote_id: u64) -> Result<Vec<Event>, Error> {
        let lote = Self::load_lote(&env, lote_id)?;
        let mut events = Vec::new(&env);
        let mut idx = 0u32;
        while idx < lote.event_count {
            let event: Event = env
                .storage()
                .persistent()
                .get(&DataKey::Event(lote_id, idx))
                .ok_or(Error::EventNotFound)?;
            events.push_back(event);
            idx += 1;
        }
        Ok(events)
    }

    /// Cantidad total de lotes minteados.
    pub fn lote_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::LoteCount)
            .unwrap_or(0)
    }

    fn require_admin(env: &Env) -> Result<Address, Error> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;
        admin.require_auth();
        Ok(admin)
    }

    fn load_lote(env: &Env, lote_id: u64) -> Result<Lote, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Lote(lote_id))
            .ok_or(Error::LoteNotFound)
    }
}

mod test;
