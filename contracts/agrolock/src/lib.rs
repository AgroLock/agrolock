//! AgroLock milestone escrow contract.
//!
//! A buyer funds a fixed amount of a token (in production, a Stellar-anchored
//! Naira stablecoin) into this contract on behalf of a farmer. The amount is
//! split into milestone tranches (e.g. planting / mid-season / delivery).
//! Each tranche only pays out to the farmer once a quorum of signatures from
//! {buyer, farmer, attestor} confirm that milestone happened in the real
//! world. If a milestone is disputed instead, the same quorum mechanism can
//! vote to refund that tranche back to the buyer.
//!
//! MVP verification model: milestone confirmation is a trusted multi-sig
//! (see `confirm_milestone`) rather than a trustless oracle. A neutral local
//! attestor (extension officer / cooperative lead) is one of the three
//! signers precisely so no single party can move funds alone.
//!
//! TODO (Phase 4, post-MVP): replace/augment the trusted-attestor signature
//! with satellite imagery or IoT sensor-fed oracle data for stronger,
//! less trust-dependent milestone verification. Out of scope for the MVP.

#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env, String, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum MilestoneStatus {
    Pending,
    Released,
    Disputed,
    Refunded,
}

#[contracttype]
#[derive(Clone)]
pub struct Milestone {
    pub description: String,
    pub amount: i128,
    pub status: MilestoneStatus,
    pub release_votes: Vec<Address>,
    pub refund_votes: Vec<Address>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum EscrowStatus {
    Created,
    Funded,
    Completed,
}

#[contracttype]
#[derive(Clone)]
pub struct Escrow {
    pub buyer: Address,
    pub farmer: Address,
    pub attestor: Address,
    pub token: Address,
    pub total_amount: i128,
    /// Number of distinct signatures (out of buyer/farmer/attestor) needed
    /// to release or refund a tranche. Recommended default: 2 (of 3).
    pub quorum: u32,
    pub status: EscrowStatus,
    pub milestones: Vec<Milestone>,
}

#[contracttype]
pub enum DataKey {
    Counter,
    Escrow(u64),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotFound = 1,
    NotAParty = 2,
    NotCreated = 3,
    NotFunded = 4,
    MilestoneCountMismatch = 5,
    AmountMismatch = 6,
    InvalidQuorum = 7,
    MilestoneNotPending = 8,
    MilestoneNotDisputed = 9,
    AlreadyVoted = 10,
    QuorumNotMet = 11,
    InvalidMilestoneId = 12,
}

const DAY_LEDGERS: u32 = 17280; // ~5s/ledger
const BUMP_AMOUNT: u32 = DAY_LEDGERS * 30; // keep escrow data alive ~30 days
const THRESHOLD: u32 = DAY_LEDGERS * 15; // renew once <15 days of TTL remain

#[contract]
pub struct AgroLockContract;

#[contractimpl]
impl AgroLockContract {
    /// Create a new milestone escrow between buyer, farmer, and attestor.
    /// `milestone_descriptions[i]` / `milestone_amounts[i]` pair up by index;
    /// the amounts must sum to exactly `total_amount`. `quorum` is how many
    /// of the 3 parties must sign off before a tranche releases or a
    /// disputed tranche refunds (2 is the recommended default).
    ///
    /// Only creates the record — no funds move until `fund_escrow`.
    pub fn create_escrow(
        env: Env,
        buyer: Address,
        farmer: Address,
        attestor: Address,
        token: Address,
        total_amount: i128,
        milestone_descriptions: Vec<String>,
        milestone_amounts: Vec<i128>,
        quorum: u32,
    ) -> Result<u64, Error> {
        buyer.require_auth();

        if milestone_descriptions.len() != milestone_amounts.len() || milestone_descriptions.is_empty() {
            return Err(Error::MilestoneCountMismatch);
        }
        if quorum == 0 || quorum > 3 {
            return Err(Error::InvalidQuorum);
        }

        let mut sum: i128 = 0;
        let mut milestones: Vec<Milestone> = Vec::new(&env);
        for i in 0..milestone_amounts.len() {
            let amount = milestone_amounts.get(i).unwrap();
            sum += amount;
            milestones.push_back(Milestone {
                description: milestone_descriptions.get(i).unwrap(),
                amount,
                status: MilestoneStatus::Pending,
                release_votes: Vec::new(&env),
                refund_votes: Vec::new(&env),
            });
        }
        if sum != total_amount {
            return Err(Error::AmountMismatch);
        }

        let id = Self::next_id(&env);
        let escrow = Escrow {
            buyer: buyer.clone(),
            farmer,
            attestor,
            token,
            total_amount,
            quorum,
            status: EscrowStatus::Created,
            milestones,
        };
        Self::save(&env, id, &escrow);

        env.events().publish((symbol_short!("created"), id), (buyer, total_amount));
        Ok(id)
    }

    /// Buyer deposits `total_amount` of the escrow's token into the
    /// contract, moving it from Created -> Funded. Must be called by the
    /// buyer (enforced via `require_auth`).
    pub fn fund_escrow(env: Env, escrow_id: u64) -> Result<(), Error> {
        let mut escrow = Self::load(&env, escrow_id)?;
        if escrow.status != EscrowStatus::Created {
            return Err(Error::NotCreated);
        }
        escrow.buyer.require_auth();

        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(&escrow.buyer, &env.current_contract_address(), &escrow.total_amount);

        escrow.status = EscrowStatus::Funded;
        Self::save(&env, escrow_id, &escrow);

        env.events().publish((symbol_short!("funded"), escrow_id), escrow.buyer.clone());
        Ok(())
    }

    /// One of buyer/farmer/attestor signs off that `milestone_id` has been
    /// met in the real world. Returns the running vote count. Once
    /// `quorum` distinct signatures are collected, call `release_tranche`
    /// to pay the farmer.
    pub fn confirm_milestone(env: Env, escrow_id: u64, milestone_id: u32, signer: Address) -> Result<u32, Error> {
        signer.require_auth();
        let mut escrow = Self::load(&env, escrow_id)?;
        if escrow.status != EscrowStatus::Funded {
            return Err(Error::NotFunded);
        }
        Self::require_party(&escrow, &signer)?;

        let mut m = escrow.milestones.get(milestone_id).ok_or(Error::InvalidMilestoneId)?;
        if m.status != MilestoneStatus::Pending {
            return Err(Error::MilestoneNotPending);
        }
        if m.release_votes.contains(&signer) {
            return Err(Error::AlreadyVoted);
        }
        m.release_votes.push_back(signer.clone());
        let vote_count = m.release_votes.len();
        escrow.milestones.set(milestone_id, m);
        Self::save(&env, escrow_id, &escrow);

        env.events().publish((symbol_short!("confirm"), escrow_id, milestone_id), signer);
        Ok(vote_count)
    }

    /// Pays a milestone's tranche to the farmer once `quorum` signatures
    /// have confirmed it. Callable by anyone once the threshold is met —
    /// the contract (not the caller) authorizes the transfer, since it is
    /// releasing funds it already escrowed under its own address.
    pub fn release_tranche(env: Env, escrow_id: u64, milestone_id: u32) -> Result<(), Error> {
        let mut escrow = Self::load(&env, escrow_id)?;
        if escrow.status != EscrowStatus::Funded {
            return Err(Error::NotFunded);
        }
        let mut m = escrow.milestones.get(milestone_id).ok_or(Error::InvalidMilestoneId)?;
        if m.status != MilestoneStatus::Pending {
            return Err(Error::MilestoneNotPending);
        }
        if m.release_votes.len() < escrow.quorum {
            return Err(Error::QuorumNotMet);
        }

        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(&env.current_contract_address(), &escrow.farmer, &m.amount);
        m.status = MilestoneStatus::Released;
        escrow.milestones.set(milestone_id, m);

        if Self::all_settled(&escrow) {
            escrow.status = EscrowStatus::Completed;
        }
        Self::save(&env, escrow_id, &escrow);

        env.events().publish((symbol_short!("released"), escrow_id, milestone_id), (escrow.farmer.clone(), m.amount));
        Ok(())
    }

    /// Buyer, farmer, or attestor flags a still-pending milestone as
    /// disputed, freezing `confirm_milestone` / `release_tranche` for it
    /// until it's resolved through the `refund` voting flow below.
    pub fn dispute(env: Env, escrow_id: u64, milestone_id: u32, signer: Address) -> Result<(), Error> {
        signer.require_auth();
        let mut escrow = Self::load(&env, escrow_id)?;
        Self::require_party(&escrow, &signer)?;

        let mut m = escrow.milestones.get(milestone_id).ok_or(Error::InvalidMilestoneId)?;
        if m.status != MilestoneStatus::Pending {
            return Err(Error::MilestoneNotPending);
        }
        m.status = MilestoneStatus::Disputed;
        escrow.milestones.set(milestone_id, m);
        Self::save(&env, escrow_id, &escrow);

        env.events().publish((symbol_short!("disputed"), escrow_id, milestone_id), signer);
        Ok(())
    }

    /// One of the 3 parties votes to refund a *disputed* milestone's
    /// tranche back to the buyer. Returns the running vote count. Once
    /// `quorum` refund-votes are collected, the tranche is returned to the
    /// buyer immediately in the same call.
    pub fn refund(env: Env, escrow_id: u64, milestone_id: u32, signer: Address) -> Result<u32, Error> {
        signer.require_auth();
        let mut escrow = Self::load(&env, escrow_id)?;
        Self::require_party(&escrow, &signer)?;

        let mut m = escrow.milestones.get(milestone_id).ok_or(Error::InvalidMilestoneId)?;
        if m.status != MilestoneStatus::Disputed {
            return Err(Error::MilestoneNotDisputed);
        }
        if m.refund_votes.contains(&signer) {
            return Err(Error::AlreadyVoted);
        }
        m.refund_votes.push_back(signer.clone());
        let vote_count = m.refund_votes.len();

        if vote_count >= escrow.quorum {
            let token_client = token::Client::new(&env, &escrow.token);
            token_client.transfer(&env.current_contract_address(), &escrow.buyer, &m.amount);
            m.status = MilestoneStatus::Refunded;
        }
        escrow.milestones.set(milestone_id, m);

        if Self::all_settled(&escrow) {
            escrow.status = EscrowStatus::Completed;
        }
        Self::save(&env, escrow_id, &escrow);

        env.events().publish((symbol_short!("refunded"), escrow_id, milestone_id), (signer, m.amount));
        Ok(vote_count)
    }

    /// Allows any party to vote on resolving a disputed milestone, specifying
    /// whether to release to the farmer (`release_to_farmer == true`) or refund to the buyer.
    /// Once `quorum` votes are collected for either option, funds are transferred.
    pub fn resolve_dispute(
        env: Env,
        escrow_id: u64,
        milestone_id: u32,
        release_to_farmer: bool,
        signer: Address,
    ) -> Result<u32, Error> {
        signer.require_auth();
        let mut escrow = Self::load(&env, escrow_id)?;
        if escrow.status != EscrowStatus::Funded {
            return Err(Error::NotFunded);
        }
        Self::require_party(&escrow, &signer)?;

        let mut m = escrow.milestones.get(milestone_id).ok_or(Error::InvalidMilestoneId)?;
        if m.status != MilestoneStatus::Disputed {
            return Err(Error::MilestoneNotDisputed);
        }

        if release_to_farmer {
            if m.release_votes.contains(&signer) {
                return Err(Error::AlreadyVoted);
            }
            m.release_votes.push_back(signer.clone());
            let vote_count = m.release_votes.len();

            if vote_count >= escrow.quorum {
                let token_client = token::Client::new(&env, &escrow.token);
                token_client.transfer(&env.current_contract_address(), &escrow.farmer, &m.amount);
                m.status = MilestoneStatus::Released;
            }
            escrow.milestones.set(milestone_id, m);

            if Self::all_settled(&escrow) {
                escrow.status = EscrowStatus::Completed;
            }
            Self::save(&env, escrow_id, &escrow);
            env.events().publish((symbol_short!("resolved"), escrow_id, milestone_id), (signer, true));
            Ok(vote_count)
        } else {
            if m.refund_votes.contains(&signer) {
                return Err(Error::AlreadyVoted);
            }
            m.refund_votes.push_back(signer.clone());
            let vote_count = m.refund_votes.len();

            if vote_count >= escrow.quorum {
                let token_client = token::Client::new(&env, &escrow.token);
                token_client.transfer(&env.current_contract_address(), &escrow.buyer, &m.amount);
                m.status = MilestoneStatus::Refunded;
            }
            escrow.milestones.set(milestone_id, m);

            if Self::all_settled(&escrow) {
                escrow.status = EscrowStatus::Completed;
            }
            Self::save(&env, escrow_id, &escrow);
            env.events().publish((symbol_short!("resolved"), escrow_id, milestone_id), (signer, false));
            Ok(vote_count)
        }
    }

    /// Allows the buyer to cancel an unfunded escrow in `Created` state.
    pub fn cancel_escrow(env: Env, escrow_id: u64) -> Result<(), Error> {
        let escrow = Self::load(&env, escrow_id)?;
        if escrow.status != EscrowStatus::Created {
            return Err(Error::NotCreated);
        }
        escrow.buyer.require_auth();

        let key = DataKey::Escrow(escrow_id);
        env.storage().persistent().remove(&key);

        env.events().publish((symbol_short!("cancelled"), escrow_id), escrow.buyer);
        Ok(())
    }

    // ---- read-only views (no auth required) ----

    pub fn get_escrow(env: Env, escrow_id: u64) -> Result<Escrow, Error> {
        Self::load(&env, escrow_id)
    }

    pub fn get_milestone(env: Env, escrow_id: u64, milestone_id: u32) -> Result<Milestone, Error> {
        let escrow = Self::load(&env, escrow_id)?;
        escrow.milestones.get(milestone_id).ok_or(Error::InvalidMilestoneId)
    }

    // ---- internal helpers ----

    fn next_id(env: &Env) -> u64 {
        let current: u64 = env.storage().instance().get(&DataKey::Counter).unwrap_or(0);
        let next = current + 1;
        env.storage().instance().set(&DataKey::Counter, &next);
        env.storage().instance().extend_ttl(THRESHOLD, BUMP_AMOUNT);
        next
    }

    fn load(env: &Env, escrow_id: u64) -> Result<Escrow, Error> {
        let key = DataKey::Escrow(escrow_id);
        let escrow: Escrow = env.storage().persistent().get(&key).ok_or(Error::NotFound)?;
        env.storage().persistent().extend_ttl(&key, THRESHOLD, BUMP_AMOUNT);
        Ok(escrow)
    }

    fn save(env: &Env, escrow_id: u64, escrow: &Escrow) {
        let key = DataKey::Escrow(escrow_id);
        env.storage().persistent().set(&key, escrow);
        env.storage().persistent().extend_ttl(&key, THRESHOLD, BUMP_AMOUNT);
    }

    fn require_party(escrow: &Escrow, addr: &Address) -> Result<(), Error> {
        if *addr == escrow.buyer || *addr == escrow.farmer || *addr == escrow.attestor {
            Ok(())
        } else {
            Err(Error::NotAParty)
        }
    }

    fn all_settled(escrow: &Escrow) -> bool {
        for m in escrow.milestones.iter() {
            if m.status == MilestoneStatus::Pending || m.status == MilestoneStatus::Disputed {
                return false;
            }
        }
        true
    }
}

mod test;
