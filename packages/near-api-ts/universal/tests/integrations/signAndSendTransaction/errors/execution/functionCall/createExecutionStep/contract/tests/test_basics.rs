use near_api::{AccountId, NearGas, NearToken};
use near_sdk::serde_json::json;

async fn create_subaccount(
  sandbox: &near_sandbox::Sandbox,
  name: &str,
) -> testresult::TestResult<near_api::Account> {
  let account_id: AccountId = name.parse().unwrap();
  sandbox
    .create_account(account_id.clone())
    .initial_balance(NearToken::from_near(10))
    .send()
    .await?;
  Ok(near_api::Account(account_id))
}

async fn test_basics_on(contract_wasm: Vec<u8>) -> testresult::TestResult<()> {
  let sandbox = near_sandbox::Sandbox::start_sandbox().await?;
  let sandbox_network = near_api::NetworkConfig::from_rpc_url("sandbox", sandbox.rpc_addr.parse()?);

  let contract = create_subaccount(&sandbox, "contract.sandbox")
    .await?
    .as_contract();

  let signer = near_api::Signer::from_secret_key(
    near_sandbox::config::DEFAULT_GENESIS_ACCOUNT_PRIVATE_KEY
      .parse()
      .unwrap(),
  )?;

  near_api::Contract::deploy(contract.account_id().clone())
    .use_code(contract_wasm)
    .without_init_call()
    .with_signer(signer.clone())
    .send_to(&sandbox_network)
    .await?
    .assert_success();

  // contract
  //     .call_function("bid", ())
  //     .transaction()
  //     .deposit(NearToken::from_near(1))
  //     .with_signer(alice.account_id().clone(), signer.clone())
  //     .send_to(&sandbox_network)
  //     .await?
  //     .assert_success();
  //

  Ok(())
}

#[tokio::test]
async fn test_contract_is_operational() -> testresult::TestResult<()> {
  let contract_wasm_path = cargo_near_build::build_with_cli(Default::default())?;
  let contract_wasm = std::fs::read(contract_wasm_path)?;

  test_basics_on(contract_wasm).await
}

// Alice makes first bid
// contract
//     .call_function("bid", ())
//     .transaction()
//     .deposit(NearToken::from_near(1))
//     .with_signer(alice.account_id().clone(), signer.clone())
//     .send_to(&sandbox_network)
//     .await?
//     .assert_success();
//
// let highest_bid: Bid = contract
//     .call_function("get_highest_bid", ())
//     .read_only()
//     .fetch_from(&sandbox_network)
//     .await?
//     .data;
// assert_eq!(highest_bid.bid, NearToken::from_near(1));
// assert_eq!(&highest_bid.bidder, alice.account_id());
//
// let alice_balance = alice
//     .tokens()
//     .near_balance()
//     .fetch_from(&sandbox_network)
//     .await?
//     .total;
//
// // Bob makes a higher bid
// contract
//     .call_function("bid", ())
//     .transaction()
//     .deposit(NearToken::from_near(2))
//     .with_signer(bob.account_id().clone(), signer.clone())
//     .send_to(&sandbox_network)
//     .await?
//     .assert_success();
//
// let highest_bid: Bid = contract
//     .call_function("get_highest_bid", ())
//     .read_only()
//     .fetch_from(&sandbox_network)
//     .await?
//     .data;
// assert_eq!(highest_bid.bid, NearToken::from_near(2));
// assert_eq!(&highest_bid.bidder, bob.account_id());
//
// // Check that Alice was refunded
// let new_alice_balance = alice
//     .tokens()
//     .near_balance()
//     .fetch_from(&sandbox_network)
//     .await?
//     .total;
//
// assert!(new_alice_balance == alice_balance.saturating_add(NearToken::from_near(1)));
//
// // Alice tries to make a bid with less NEAR than the previous
// contract
//     .call_function("bid", ())
//     .transaction()
//     .deposit(NearToken::from_near(1))
//     .with_signer(alice.account_id().clone(), signer.clone())
//     .send_to(&sandbox_network)
//     .await?
//     .assert_failure();
//
// // Auctioneer claims auction but did not finish
// contract
//     .call_function("claim", ())
//     .transaction()
//     .gas(NearGas::from_tgas(30))
//     .with_signer(auctioneer.account_id().clone(), signer.clone())
//     .send_to(&sandbox_network)
//     .await?
//     .assert_failure();
//
// // Fast forward 200 blocks
// let blocks_to_advance = 200;
// sandbox.fast_forward(blocks_to_advance).await?;
//
// // Auctioneer claims the auction
// contract
//     .call_function("claim", ())
//     .transaction()
//     .gas(NearGas::from_tgas(30))
//     .with_signer(auctioneer.account_id().clone(), signer.clone())
//     .send_to(&sandbox_network)
//     .await?
//     .assert_success();
//
// // Checks the auctioneer has the correct balance
// let auctioneer_balance = auctioneer
//     .tokens()
//     .near_balance()
//     .fetch_from(&sandbox_network)
//     .await?
//     .total;
// assert!(auctioneer_balance <= NearToken::from_near(12));
// assert!(auctioneer_balance > NearToken::from_millinear(11990));
//
// // Auctioneer tries to claim the auction again
// contract
//     .call_function("claim", ())
//     .transaction()
//     .gas(NearGas::from_tgas(30))
//     .with_signer(auctioneer.account_id().clone(), signer.clone())
//     .send_to(&sandbox_network)
//     .await?
//     .assert_failure();
//
// // Alice tries to make a bid when the auction is over
// contract
//     .call_function("bid", ())
//     .transaction()
//     .deposit(NearToken::from_near(1))
//     .with_signer(alice.account_id().clone(), signer.clone())
//     .send_to(&sandbox_network)
//     .await?
//     .assert_failure();