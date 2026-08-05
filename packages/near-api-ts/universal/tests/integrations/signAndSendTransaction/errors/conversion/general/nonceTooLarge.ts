import { transfer } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/helpers/signTransaction';
import { assertUnmappedInvalidTxError } from '../../../../../utils/assertUnmappedInvalidTxError';
import type { TestContext } from './general.test';

// `AccessKey::ACCESS_KEY_NONCE_RANGE_MULTIPLIER` — the nonce of a transaction has to stay
// below `blockHeight * multiplier`, which is what a fresh access key starts from.
const ACCESS_KEY_NONCE_RANGE_MULTIPLIER = 1_000_000;

/**
 * Unreachable over JSON-RPC, so the case is registered as skipped (see `general.test.ts`).
 *
 * `verify_nonce` (`runtime/runtime/src/verifier.rs`) only compares the nonce against the upper
 * bound when it is given a block height, and the RPC-level check deliberately passes `None`:
 * "Here we do not know which block the transaction will be included and therefore use `None`
 * as `block_height` to skip the check on the nonce upper bound"
 * (`ChainRuntimeAdapter::can_verify_and_charge_tx`, `chain/chain/src/runtime/mod.rs`). So the
 * transaction is accepted into the pool, and the only place that does pass a height —
 * `prepare_transactions`, while a chunk is being produced — drops it as invalid without
 * recording an outcome.
 *
 * From the client the transaction therefore looks like one that never made it into a chunk:
 * `safeSendSignedTransaction` waits for it and ends up with
 * `Client.SendSignedTransaction.Rpc.BlockHash.Expired` once the validity period is over.
 * Measured on 2.13.2; the assertion below is what the node would report if the check ever ran
 * on the submission path.
 */
export const nonceTooLarge = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const { rawRpcResult } = await client.getBlock({ blockReference: 'LatestFinalBlock' });
  const upperBound = rawRpcResult.header.height * ACCESS_KEY_NONCE_RANGE_MULTIPLIER;
  const txNonce = upperBound + 1;

  const { blockHash } = await client.getAccountAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: defaultKeyPair.publicKey,
      nonce: txNonce,
      blockHash,
      action: transfer({ amount: { yoctoNear: '1' } }),
      receiverAccountId: 'bob',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertUnmappedInvalidTxError(tx, { NonceTooLarge: { txNonce, upperBound } });
};
