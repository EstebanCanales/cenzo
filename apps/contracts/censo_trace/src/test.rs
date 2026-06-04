#![cfg(test)]

use super::*;
use soroban_sdk::{
    symbol_short,
    testutils::{Address as _, Ledger as _},
    Address, BytesN, Env, String,
};

fn setup() -> (Env, CensoTraceClient<'static>, Address) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(CensoTrace, ());
    let client = CensoTraceClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    client.initialize(&admin);
    (env, client, admin)
}

#[test]
fn initialize_sets_admin() {
    let (_env, client, admin) = setup();
    assert_eq!(client.admin(), admin);
    assert_eq!(client.lote_count(), 0);
}

#[test]
fn initialize_twice_fails() {
    let (_env, client, _admin) = setup();
    let other = Address::generate(&_env);
    assert_eq!(
        client.try_initialize(&other),
        Err(Ok(Error::AlreadyInitialized))
    );
}

#[test]
fn mint_lote_creates_nft() {
    let (env, client, admin) = setup();
    let producer = String::from_str(&env, "Finca La Esperanza");
    let uri = String::from_str(&env, "ipfs://meta/1");

    let id = client.mint_lote(&producer, &uri);
    assert_eq!(id, 1);
    assert_eq!(client.lote_count(), 1);

    let lote = client.get_lote(&id);
    assert_eq!(lote.owner, admin);
    assert_eq!(lote.producer, producer);
    assert_eq!(lote.metadata_uri, uri);
    assert_eq!(lote.tier, Tier::None);
    assert_eq!(lote.status, Status::Active);
    assert_eq!(lote.event_count, 0);
}

#[test]
fn mint_increments_ids() {
    let (env, client, _admin) = setup();
    let p = String::from_str(&env, "Finca");
    let u = String::from_str(&env, "ipfs://x");
    assert_eq!(client.mint_lote(&p, &u), 1);
    assert_eq!(client.mint_lote(&p, &u), 2);
    assert_eq!(client.mint_lote(&p, &u), 3);
    assert_eq!(client.lote_count(), 3);
}

#[test]
fn append_event_anchors_hash() {
    let (env, client, _admin) = setup();
    env.ledger().set_timestamp(1_700_000_000);
    let id = client.mint_lote(
        &String::from_str(&env, "Finca"),
        &String::from_str(&env, "ipfs://x"),
    );

    let hash = BytesN::from_array(&env, &[7u8; 32]);
    let actor = String::from_str(&env, "finca:esperanza");
    let idx = client.append_event(&id, &symbol_short!("siembra"), &actor, &hash);
    assert_eq!(idx, 0);

    let lote = client.get_lote(&id);
    assert_eq!(lote.event_count, 1);

    let event = client.get_event(&id, &0);
    assert_eq!(event.stage, symbol_short!("siembra"));
    assert_eq!(event.actor, actor);
    assert_eq!(event.hash, hash);
    assert_eq!(event.timestamp, 1_700_000_000);
}

#[test]
fn append_multiple_events_in_order() {
    let (env, client, _admin) = setup();
    let id = client.mint_lote(
        &String::from_str(&env, "Finca"),
        &String::from_str(&env, "ipfs://x"),
    );
    let actor = String::from_str(&env, "finca");
    let h0 = BytesN::from_array(&env, &[1u8; 32]);
    let h1 = BytesN::from_array(&env, &[2u8; 32]);

    assert_eq!(client.append_event(&id, &symbol_short!("siembra"), &actor, &h0), 0);
    assert_eq!(client.append_event(&id, &symbol_short!("fertiliz"), &actor, &h1), 1);

    let events = client.get_events(&id);
    assert_eq!(events.len(), 2);
    assert_eq!(events.get(0).unwrap().hash, h0);
    assert_eq!(events.get(1).unwrap().hash, h1);
}

#[test]
fn set_certification_updates_tier() {
    let (env, client, _admin) = setup();
    let id = client.mint_lote(
        &String::from_str(&env, "Finca"),
        &String::from_str(&env, "ipfs://x"),
    );
    client.set_certification(&id, &Tier::Diamante);
    assert_eq!(client.get_lote(&id).tier, Tier::Diamante);
}

#[test]
fn get_missing_lote_errors() {
    let (_env, client, _admin) = setup();
    assert_eq!(client.try_get_lote(&999), Err(Ok(Error::LoteNotFound)));
}

#[test]
fn append_to_missing_lote_errors() {
    let (env, client, _admin) = setup();
    let hash = BytesN::from_array(&env, &[0u8; 32]);
    let actor = String::from_str(&env, "x");
    assert_eq!(
        client.try_append_event(&42, &symbol_short!("siembra"), &actor, &hash),
        Err(Ok(Error::LoteNotFound))
    );
}
