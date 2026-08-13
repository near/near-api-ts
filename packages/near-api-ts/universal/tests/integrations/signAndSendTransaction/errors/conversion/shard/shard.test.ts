import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { describe, expect, it } from 'vitest';
import {
  addFullAccessKey,
  createAccount,
  deployContract,
  functionCall,
  keyPair,
  transfer,
} from '../../../../../../index';
import { safeSleep } from '../../../../../../src/createClient/transport/sendRequest/_common/sleep';
import { signTransaction } from '../../../../../../src/signServices/signTransaction/signTransaction';
import {
  assertUnmappedInvalidTxError,
  getUnmappedInvalidTxError,
} from '../../../../../utils/assertUnmappedInvalidTxError';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';
import { GAS_BURNER_FUNCTION_NAME, GAS_BURNER_WASM } from '../../../../../utils/wasm/gasBurner';

const CONTRACT_ACCOUNT_ID = 'burner.nat';

// `reject_tx_congestion_threshold`: the shard stops accepting transactions once its congestion
// level reaches this fraction of a fully congested one.
const REJECT_TX_CONGESTION_THRESHOLD = 0.8;

// `max_total_prepaid_gas`, and with it the congestion every queued receipt is worth.
const PREPAID_TERA_GAS = '1000';

// That threshold of `max_congestion_incoming_gas` (400 Pgas) is 320 Pgas of delayed receipts,
// so at 1000 TGas apiece the queue has to hold 320 of them.
const CALLS_PER_ROUND = 400;
const ROUNDS = 12;

/**
 * Nothing is wrong with the transaction — the receiving shard can't take it right now.
 *
 * Building that backlog needs receipts that are far more expensive to execute than to create:
 * a transaction converts for ~0.3 TGas while `burn` spends the whole 1000 TGas attached to it,
 * so a chunk (1 Pgas gas limit) drains one receipt while hundreds arrive. Everything queued
 * counts with its full prepaid gas, and once the queue passes the threshold
 * `congestion_control_accepts_transaction` turns down anything addressed to the shard.
 *
 * `Shard.Congested` deliberately has no `ConversionFailureRegistry` kind of its own and falls to
 * `Client.SendSignedTransaction.Internal` instead: it is transient — the shard works through its
 * backlog on its own — so a caller gets no actionable use out of a dedicated kind, only a reason
 * to retry, which is the library's job. Kept here and skipped rather than deleted, since building
 * the state below still documents how the node produces it; flooding a sandbox shard until it
 * stops accepting transactions takes about a minute.
 *
 * Its sibling `Shard.Stuck` (100 missed chunks) is covered separately, in `stuck.test.ts`,
 * because it needs a chain whose shard has lost its chunk producer.
 */
describe.skip('signAndSendTransaction › Shard.Congested conversion error', () => {
  it('fails with Shard.Congested when the receiving shard is working through a receipt backlog', {
    timeout: 180_000,
  }, async () => {
    const defaultKeyPair = keyPair(DEFAULT_PRIVATE_KEY);
    const sandbox = await startSandbox();
    const client = createDefaultClient(sandbox);
    const { rpcUrl } = sandbox;

    try {
      const natKey = await client.getAccountAccessKey({
        accountId: 'nat',
        publicKey: defaultKeyPair.publicKey,
      });

      const deployTransaction = await signTransaction({
        signDataProvider: defaultKeyPair,
        transaction: {
          signerAccountId: 'nat',
          signerPublicKey: defaultKeyPair.publicKey,
          nonce: natKey.accountAccessKey.nonce + 1,
          blockHash: natKey.blockHash,
          actions: [
            createAccount(),
            transfer({ amount: { near: '50' } }),
            addFullAccessKey({ publicKey: defaultKeyPair.publicKey }),
            deployContract({ wasmBytes: GAS_BURNER_WASM }),
          ],
          receiverAccountId: CONTRACT_ACCOUNT_ID,
        },
      });

      await client.sendSignedTransaction({
        signedTransaction: deployTransaction,
        minimalProcessingStage: 'CompletedFinal',
      });

      let nonce = natKey.accountAccessKey.nonce + 2;

      const currentBlockHash = async () =>
        (
          await client.getAccountAccessKey({
            accountId: 'nat',
            publicKey: defaultKeyPair.publicKey,
          })
        ).blockHash;

      /**
       * The flood has to be fire-and-forget: `sendSignedTransaction` waits for the transaction
       * to be executed, and these transactions are queued behind the very backlog they create.
       * So they go straight to `send_tx` with `wait_until: NONE`, which is the one thing the
       * client doesn't expose.
       */
      const flood = async (blockHash: string) => {
        const transactions = await Promise.all(
          Array.from({ length: CALLS_PER_ROUND }, () =>
            signTransaction({
              signDataProvider: defaultKeyPair,
              transaction: {
                signerAccountId: 'nat',
                signerPublicKey: defaultKeyPair.publicKey,
                nonce: nonce++,
                blockHash,
                action: functionCall({
                  functionName: GAS_BURNER_FUNCTION_NAME,
                  gasLimit: { teraGas: PREPAID_TERA_GAS },
                }),
                receiverAccountId: CONTRACT_ACCOUNT_ID,
              },
            }),
          ),
        );

        await Promise.all(
          transactions.map(({ signedTransactionBorsh64 }) =>
            fetch(rpcUrl, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'flood',
                method: 'send_tx',
                params: { signed_tx_base64: signedTransactionBorsh64, wait_until: 'NONE' },
              }),
            }).catch(() => undefined),
          ),
        );
      };

      for (let round = 0; round < ROUNDS; round++) {
        const blockHash = await currentBlockHash();
        await flood(blockHash);
        await safeSleep(1000);

        const probe = await signTransaction({
          signDataProvider: defaultKeyPair,
          transaction: {
            signerAccountId: 'nat',
            signerPublicKey: defaultKeyPair.publicKey,
            nonce: nonce++,
            blockHash,
            action: transfer({ amount: { yoctoNear: '1' } }),
            receiverAccountId: 'alice',
          },
        });

        const tx = await client.safeSendSignedTransaction({ signedTransaction: probe });

        // `Shard.Congested` has no `ConversionFailureRegistry` kind of its own right now, so it
        // surfaces as `Client.SendSignedTransaction.Internal` — peek at the raw nearcore payload
        // to tell it apart from an unrelated internal failure before asserting on it.
        const raw = getUnmappedInvalidTxError(tx) as
          | { ShardCongested: { shardId: number; congestionLevel: number } }
          | undefined;

        if (raw?.ShardCongested) {
          const { shardId, congestionLevel } = raw.ShardCongested;

          assertUnmappedInvalidTxError(tx, { ShardCongested: { shardId, congestionLevel } });

          // The single shard of the sandbox, congested by however much the queue has grown past
          // the threshold the node turns transactions down at.
          expect(shardId).toBe(0);
          expect(congestionLevel).toBeGreaterThanOrEqual(REJECT_TX_CONGESTION_THRESHOLD);
          expect(congestionLevel).toBeLessThanOrEqual(1);
          return;
        }
      }

      throw new Error(`The shard did not get congested after ${ROUNDS * CALLS_PER_ROUND} calls`);
    } finally {
      await sandbox.stop();
    }
  });
});
