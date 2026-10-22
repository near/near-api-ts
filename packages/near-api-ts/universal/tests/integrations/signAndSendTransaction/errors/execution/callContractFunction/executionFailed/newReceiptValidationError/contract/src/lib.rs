use near_sdk::{env, near, NearToken};

#[near(contract_state)]
#[derive(Default)]
pub struct Contract {}

#[near]
impl Contract {
  pub fn delete_action_must_be_final(&mut self) {
    let promise_idx = env::promise_batch_create(&env::current_account_id());
    let account_id = env::current_account_id();

    env::promise_batch_action_delete_account(promise_idx, &account_id);
    env::promise_batch_action_transfer(promise_idx, NearToken::from_near(1))
  }
}
