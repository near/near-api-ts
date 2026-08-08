import { expect } from 'vitest';
import { deployContract } from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/helpers/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import type { TestContext } from '../action.test';

// `max_contract_size` from the runtime config.
const MAX_CONTRACT_WASM_SIZE_BYTES = 4_194_304;
const CONTRACT_WASM_SIZE_BYTES = MAX_CONTRACT_WASM_SIZE_BYTES + 1;

/**
 * Unreachable over JSON-RPC, so the case is registered as skipped (see `action.test.ts`).
 *
 * The limit sits at 4 MiB, while the node buffers at most 2 MiB of request body — the ceiling
 * `general/transactionSizeExceeded` documents in full. Any wasm large enough to fail this check
 * is already more than twice too large to be delivered, so `safeSendSignedTransaction` fails
 * with `Client.SendSignedTransaction.Exhausted` instead. The check itself stays live for
 * transactions that arrive inside a chunk rather than through the HTTP layer.
 *
 * `max_transaction_size` (1.5 MiB) is lower still, but it is checked in
 * `check_valid_for_config` — after the actions are validated — so this variant would be the one
 * reported if the transaction ever made it to the node.
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
      action: deployContract({ wasmBytes: new Uint8Array(CONTRACT_WASM_SIZE_BYTES) }),
      receiverAccountId: 'nat',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(
    tx,
    'Client.SendSignedTransaction.Rpc.Action.DeployContract.ContractWasm.TooLarge',
  );
  expect(tx.error.context.info).toStrictEqual({
    contractWasmSizeBytes: CONTRACT_WASM_SIZE_BYTES,
    maximumContractWasmSizeBytes: MAX_CONTRACT_WASM_SIZE_BYTES,
  });
};
