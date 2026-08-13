#![cfg(test)]
extern crate std;

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    token::{StellarAssetClient, TokenClient},
    Env, String,
};

fn create_token<'a>(env: &Env, admin: &Address) -> (TokenClient<'a>, StellarAssetClient<'a>) {
    let sac = env.register_stellar_asset_contract_v2(admin.clone());
    let address = sac.address();
    (TokenClient::new(env, &address), StellarAssetClient::new(env, &address))
}

struct Setup<'a> {
    env: Env,
    buyer: Address,
    farmer: Address,
    attestor: Address,
    token: TokenClient<'a>,
    #[allow(dead_code)]
    token_admin: StellarAssetClient<'a>,
    contract: AgroLockContractClient<'a>,
}

fn setup() -> Setup<'static> {
    let env = Env::default();
    env.mock_all_auths();

    let buyer = Address::generate(&env);
    let farmer = Address::generate(&env);
    let attestor = Address::generate(&env);
    let token_issuer = Address::generate(&env);

    let (token, token_admin) = create_token(&env, &token_issuer);
    token_admin.mint(&buyer, &1_000_000_000);

    let contract_id = env.register(AgroLockContract, ());
    let contract = AgroLockContractClient::new(&env, &contract_id);

    Setup { env, buyer, farmer, attestor, token, token_admin, contract }
}

fn milestones(env: &Env) -> (Vec<String>, Vec<i128>, i128) {
    let descriptions = Vec::from_array(
        env,
        [
            String::from_str(env, "planting"),
            String::from_str(env, "mid-season growth"),
            String::from_str(env, "delivery"),
        ],
    );
    let amounts = Vec::from_array(env, [3_000_000i128, 3_000_000i128, 4_000_000i128]);
    (descriptions, amounts, 10_000_000i128)
}

#[test]
fn happy_path_full_release() {
    let s = setup();
    let (descriptions, amounts, total) = milestones(&s.env);

    let escrow_id = s.contract.create_escrow(
        &s.buyer,
        &s.farmer,
        &s.attestor,
        &s.token.address,
        &total,
        &descriptions,
        &amounts,
        &2,
    );

    s.contract.fund_escrow(&escrow_id);
    assert_eq!(s.token.balance(&s.contract.address), total);
    assert_eq!(s.token.balance(&s.buyer), 1_000_000_000 - total);

    for milestone_id in 0..3u32 {
        let votes = s.contract.confirm_milestone(&escrow_id, &milestone_id, &s.buyer);
        assert_eq!(votes, 1);
        let votes = s.contract.confirm_milestone(&escrow_id, &milestone_id, &s.attestor);
        assert_eq!(votes, 2);

        s.contract.release_tranche(&escrow_id, &milestone_id);
    }

    assert_eq!(s.token.balance(&s.farmer), total);
    assert_eq!(s.token.balance(&s.contract.address), 0);

    let escrow = s.contract.get_escrow(&escrow_id);
    assert_eq!(escrow.status, EscrowStatus::Completed);
    for m in escrow.milestones.iter() {
        assert_eq!(m.status, MilestoneStatus::Released);
    }
}

#[test]
fn release_requires_quorum() {
    let s = setup();
    let (descriptions, amounts, total) = milestones(&s.env);
    let escrow_id =
        s.contract.create_escrow(&s.buyer, &s.farmer, &s.attestor, &s.token.address, &total, &descriptions, &amounts, &2);
    s.contract.fund_escrow(&escrow_id);

    s.contract.confirm_milestone(&escrow_id, &0, &s.buyer);
    let result = s.contract.try_release_tranche(&escrow_id, &0);
    assert!(result.is_err());
    assert_eq!(s.token.balance(&s.farmer), 0);
}

#[test]
fn dispute_and_refund_path() {
    let s = setup();
    let (descriptions, amounts, total) = milestones(&s.env);
    let escrow_id =
        s.contract.create_escrow(&s.buyer, &s.farmer, &s.attestor, &s.token.address, &total, &descriptions, &amounts, &2);
    s.contract.fund_escrow(&escrow_id);

    let buyer_balance_after_funding = s.token.balance(&s.buyer);

    // Milestone 0 (planting) never actually happens: buyer disputes it.
    s.contract.dispute(&escrow_id, &0, &s.buyer);

    let m = s.contract.get_milestone(&escrow_id, &0);
    assert_eq!(m.status, MilestoneStatus::Disputed);

    // Buyer + attestor agree to refund the disputed tranche.
    let votes = s.contract.refund(&escrow_id, &0, &s.buyer);
    assert_eq!(votes, 1);
    assert_eq!(s.token.balance(&s.buyer), buyer_balance_after_funding); // not yet refunded

    let votes = s.contract.refund(&escrow_id, &0, &s.attestor);
    assert_eq!(votes, 2);
    assert_eq!(s.token.balance(&s.buyer), buyer_balance_after_funding + 3_000_000);

    let m = s.contract.get_milestone(&escrow_id, &0);
    assert_eq!(m.status, MilestoneStatus::Refunded);

    // The other two milestones still proceed normally.
    s.contract.confirm_milestone(&escrow_id, &1, &s.farmer);
    s.contract.confirm_milestone(&escrow_id, &1, &s.attestor);
    s.contract.release_tranche(&escrow_id, &1);
    assert_eq!(s.token.balance(&s.farmer), 3_000_000);
}

#[test]
fn non_party_cannot_confirm() {
    let s = setup();
    let (descriptions, amounts, total) = milestones(&s.env);
    let escrow_id =
        s.contract.create_escrow(&s.buyer, &s.farmer, &s.attestor, &s.token.address, &total, &descriptions, &amounts, &2);
    s.contract.fund_escrow(&escrow_id);

    let stranger = Address::generate(&s.env);
    let result = s.contract.try_confirm_milestone(&escrow_id, &0, &stranger);
    assert!(result.is_err());
}

#[test]
fn duplicate_vote_rejected() {
    let s = setup();
    let (descriptions, amounts, total) = milestones(&s.env);
    let escrow_id =
        s.contract.create_escrow(&s.buyer, &s.farmer, &s.attestor, &s.token.address, &total, &descriptions, &amounts, &2);
    s.contract.fund_escrow(&escrow_id);

    s.contract.confirm_milestone(&escrow_id, &0, &s.buyer);
    let result = s.contract.try_confirm_milestone(&escrow_id, &0, &s.buyer);
    assert!(result.is_err());
}

#[test]
fn milestone_amounts_must_sum_to_total() {
    let s = setup();
    let (descriptions, amounts, _total) = milestones(&s.env);
    let result = s.contract.try_create_escrow(
        &s.buyer,
        &s.farmer,
        &s.attestor,
        &s.token.address,
        &9_999_999i128, // wrong total
        &descriptions,
        &amounts,
        &2,
    );
    assert!(result.is_err());
}

#[test]
fn resolve_dispute_release_to_farmer() {
    let s = setup();
    let (descriptions, amounts, total) = milestones(&s.env);
    let escrow_id =
        s.contract.create_escrow(&s.buyer, &s.farmer, &s.attestor, &s.token.address, &total, &descriptions, &amounts, &2);
    s.contract.fund_escrow(&escrow_id);

    // Buyer disputes milestone 0
    s.contract.dispute(&escrow_id, &0, &s.buyer);
    let m = s.contract.get_milestone(&escrow_id, &0);
    assert_eq!(m.status, MilestoneStatus::Disputed);

    // Attestor + Farmer vote to resolve in favor of farmer
    s.contract.resolve_dispute(&escrow_id, &0, &true, &s.attestor);
    s.contract.resolve_dispute(&escrow_id, &0, &true, &s.farmer);

    let m = s.contract.get_milestone(&escrow_id, &0);
    assert_eq!(m.status, MilestoneStatus::Released);
    assert_eq!(s.token.balance(&s.farmer), 3_000_000);
}

#[test]
fn cancel_unfunded_escrow() {
    let s = setup();
    let (descriptions, amounts, total) = milestones(&s.env);
    let escrow_id =
        s.contract.create_escrow(&s.buyer, &s.farmer, &s.attestor, &s.token.address, &total, &descriptions, &amounts, &2);

    s.contract.cancel_escrow(&escrow_id);
    let result = s.contract.try_get_escrow(&escrow_id);
    assert!(result.is_err());
}
