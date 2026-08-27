import { deployContract } from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/transaction/signTransaction/signTransaction';
import { assertUnmappedInvalidTxError } from '../../../../../../utils/assertUnmappedInvalidTxError';
import type { TestContext } from '../action.test';

// `max_contract_size` from the runtime config.
const MAX_CONTRACT_WASM_SIZE_BYTES = 4_194_304;
const CONTRACT_WASM_SIZE_BYTES = MAX_CONTRACT_WASM_SIZE_BYTES + 1;

/**
 * Unreachable over JSON-RPC, so the case is registered as skipped (see `action.test.ts`) and
 * `ContractSizeExceeded` is left out of `ConversionFailureKind` until it can be observed.
 *
 * The limit sits at 4 MiB, while the node buffers at most 2 MiB of request body — the ceiling
 * `general/transactionSizeExceeded` documents in full. Any wasm large enough to fail this check
 * is already more than twice too large to be delivered, so `safeSendSignedTransaction` fails
 * with `Client.SendSignedTransaction.Exhausted` instead. The check itself stays live for
 * transactions that arrive inside a chunk rather than through the HTTP layer.
 *
 * Neither end of that gap can be moved from the outside — both are baked into `neard` at build
 * time. `max_contract_size` is embedded from `core/parameters/res/runtime_configs/parameters.yaml`
 * with `include_str!` (`core/parameters/src/config_store.rs`), and since
 * `NightshadeRuntime::from_config` always passes `runtime_config_store: None`, a sandbox falls
 * through to `RuntimeConfigStore::for_chain_id`, whose only special cases (testnet, benchmarknet,
 * congestion control test) leave the parameter alone. `GenesisConfig` has no runtime config field
 * and doesn't `deny_unknown_fields`, so one written into `genesis.json` is dropped in silence —
 * a 2.13.2 sandbox started with the override still answers `EXPERIMENTAL_protocol_config` with
 * 4_194_304. The 2 MiB is axum's implicit `DefaultBodyLimit`, equally out of the config's reach.
 *
 * `max_transaction_size` (1.5 MiB) is lower still, but it is checked in
 * `check_valid_for_config` — after the actions are validated — so this variant would be the one
 * reported if the transaction ever made it to the node. Until a build without that body limit
 * exists, the payload below is what it would answer with, and it would surface unmapped, as
 * `Client.SendSignedTransaction.Internal`.
 */
export const contractWasmTooLarge = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: defaultKeyPair.publicKey,
      nonce: accountAccessKey.nonce + 1,
      blockHash,
      // The code is never compiled at this stage, only measured, so zeroed bytes are enough.
      action: deployContract({ wasmU8: new Uint8Array(CONTRACT_WASM_SIZE_BYTES) }),
      receiverAccountId: 'nat',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertUnmappedInvalidTxError(tx, {
    ActionsValidation: {
      ContractSizeExceeded: {
        size: CONTRACT_WASM_SIZE_BYTES,
        limit: MAX_CONTRACT_WASM_SIZE_BYTES,
      },
    },
  });
};
