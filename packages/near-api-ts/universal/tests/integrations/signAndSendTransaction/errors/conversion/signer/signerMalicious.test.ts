import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import { type Client, randomEd25519KeyPair, transfer } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/transaction/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { assertTxResultConversionErrKind } from '../../../../../utils/assertTxResultConversionErrKind';
import { createDefaultClient } from '../../../../../utils/common';
import { startMaliciousSandbox } from '../../../../../utils/sandbox/maliciousChunkProducer/startMaliciousSandbox';

const SIGNER_ACCOUNT_ID = 'ghost.nat';

// The committed `neard-2_13_2-malicious` binary is a macOS/arm64 build, so there is nothing to run
// anywhere else.
const isUnsupportedPlatform = process.platform !== 'darwin' || process.arch !== 'arm64';

/**
 * The signer conversion errors of `signer.test.ts` that a stock node can never produce, because
 * they are raised while a chunk is applied rather than while a transaction is admitted. Reaching
 * them takes a chunk producer that skips runtime verification, so these run against the
 * adversarial `neard-2_13_2-malicious` binary instead of the plain sandbox.
 *
 * Kept in its own file on purpose: `startMaliciousSandbox` points `NEAR_SANDBOX_BIN_PATH` at that
 * binary for the whole process, and a `startSandbox` sharing the worker would pick it up too.
 *
 * - `InvalidSignerId` — `Runtime::process_transactions` (`runtime/runtime/src/lib.rs`) finds no
 *   account record for the signer of a transaction that is already inside a chunk. It is the same
 *   verdict `SignerDoesNotExist` carries on the admission path (`get_signer_and_access_key`,
 *   `runtime/runtime/src/verifier.rs`), so both map to `Signer.NotFound`. Since PV83
 *   (`InvalidTxGenerateOutcomes`) such a transaction no longer invalidates the chunk — it is
 *   recorded on chain as a failed outcome, which is what makes it observable by a client at all.
 */
describe.skipIf(isUnsupportedPlatform)(
  'signAndSendTransaction › Signer conversion errors (malicious chunk producer)',
  () => {
    let client: Client;

    beforeAll(async () => {
      const sandbox = await startMaliciousSandbox();
      client = createDefaultClient(sandbox);
      return () => sandbox.stop();
    });

    it('fails with Signer.NotFound when a transaction of a missing signer is packed into a chunk', async () => {
      // Same setup as the stock-node `notFound` case: an account that was never created, signed
      // with a key of its own so the signature the runtime checks before the account lookup is
      // valid.
      const signerKeyPair = randomEd25519KeyPair();

      const { blockHash } = await client.getAccountAccessKey({
        accountId: 'nat',
        publicKey: DEFAULT_PUBLIC_KEY,
      });

      const signedTransaction = await signTransaction({
        signDataProvider: signerKeyPair,
        transaction: {
          signerAccountId: SIGNER_ACCOUNT_ID,
          signerPublicKey: signerKeyPair.publicKey,
          nonce: 1,
          blockHash,
          action: transfer({ amount: { near: '1' } }),
          receiverAccountId: 'bob',
        },
      });

      // `CompletedFinal` so the outcome is on chain for the `getTransactionResult` call below.
      const tx = await client.safeSendSignedTransaction({
        signedTransaction,
        minimalProcessingStage: 'CompletedFinal',
      });

      assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Signer.NotFound');
      expect(tx.error.context.info).toStrictEqual({ signerAccountId: SIGNER_ACCOUNT_ID });

      // What makes this the `InvalidSignerId` case and not the `SignerDoesNotExist` one the stock
      // node returns: a transaction rejected by `send_tx` never exists on chain, so
      // `getTransactionResult` would fail with `Rpc.Transaction.NotFound`. Getting a
      // `ConversionFailure` back instead proves the transaction was packed into a chunk and left a
      // `Failure(InvalidTxError)` outcome there — the only path that reaches `InvalidSignerId`. It
      // also covers the second consumer of the mapping, `getConversionFailure`, which surfaces the
      // very same error as data rather than as a returned error.
      const txResult = await client.getTransactionResult({
        transactionHash: signedTransaction.transactionHash,
      });

      assertTxResultConversionErrKind(txResult, 'Signer.NotFound');
      expect(txResult.error.context).toStrictEqual({ signerAccountId: SIGNER_ACCOUNT_ID });
    });
  },
);
