use near_sdk::env::{promise_batch_create, promise_create};
use near_sdk::{AccountId, Promise, env, near, NearToken};

#[near(contract_state)]
#[derive(Default)]
pub struct Contract {}

#[near]
impl Contract {
  pub fn produce_invalid_receiver_id_error(&mut self) {
    // let account_id = "№;1".parse().unwrap();
    let account_id = AccountId::new_unvalidated("#$1".to_string());

    let promise_idx = env::promise_batch_create(&account_id);
    env::promise_batch_action_create_account(promise_idx)
  }

  pub fn invalid_delete_account_action_position(&mut self) {
    let promise_idx = env::promise_batch_create(&env::current_account_id());

    // let account_id = AccountId::new_unvalidated("#$1".to_string());
    let account_id = env::current_account_id();

    env::promise_batch_action_delete_account(promise_idx, &account_id);
    env::promise_batch_action_transfer(promise_idx,  NearToken::from_near(1))
  }
}

/*
 * The rest of this file holds the inline tests for the code above
 * Learn more about Rust tests: https://doc.rust-lang.org/book/ch11-01-writing-tests.html
//  */
// #[cfg(test)]
// mod tests {
//     use super::*;
//     use near_sdk::json_types::U64;
//     use near_sdk::test_utils::{VMContextBuilder, accounts};
//     use near_sdk::{AccountId, testing_env};
//
//     fn get_context(predecessor_account_id: AccountId) -> VMContextBuilder {
//         let mut builder = VMContextBuilder::new();
//         builder
//             .current_account_id(accounts(0))
//             .signer_account_id(predecessor_account_id.clone())
//             .predecessor_account_id(predecessor_account_id);
//         builder
//     }
//
//     #[test]
//     fn init_contract() {
//         let end_time: U64 = U64::from(1000);
//         let alice: AccountId = "alice.near".parse().unwrap();
//         let contract = Contract::init(end_time, alice.clone());
//
//         let default_bid = contract.get_highest_bid();
//         assert_eq!(default_bid.bidder, env::current_account_id());
//         assert_eq!(default_bid.bid, NearToken::from_yoctonear(1));
//
//         let auction_end_time = contract.get_auction_end_time();
//         assert_eq!(auction_end_time, end_time);
//
//         let auctioneer = contract.get_auctioneer();
//         assert_eq!(auctioneer, alice);
//
//         assert!(!contract.is_already_claimed());
//     }
// }
