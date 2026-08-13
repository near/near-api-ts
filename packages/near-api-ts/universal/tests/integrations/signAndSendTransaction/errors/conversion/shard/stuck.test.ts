import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { describe, expect, it } from 'vitest';
import { keyPair, near, transfer } from '../../../../../../index';
import { safeSleep } from '../../../../../../src/createClient/transport/sendRequest/_common/sleep';
import { signTransaction } from '../../../../../../src/createMemorySignService/signTransaction/signTransaction';
import {
  assertUnmappedInvalidTxError,
  getUnmappedInvalidTxError,
} from '../../../../../utils/assertUnmappedInvalidTxError';
import { createDefaultClient } from '../../../../../utils/common';
import { startShardedSandbox } from '../../../../../utils/sandbox/sharded/startShardedSandbox';

// `reject_tx_congestion_threshold` (0.8) of `max_congestion_missed_chunks` (125).
const MISSED_CHUNKS_TO_REJECT = 100;

const POLL_INTERVAL_MS = 1000;
const POLL_ATTEMPTS = 90;

/**
 * A shard that stops producing chunks stops accepting transactions — the missed chunks alone
 * push its congestion level over `reject_tx_congestion_threshold`, and `validate_tx` turns
 * down everything addressed to it before it even looks at the transaction.
 *
 * A single-node sandbox can't get there, since its only validator produces every chunk, which
 * is why this case runs on the two-node localnet: `node0` holds the bulk of the stake and
 * tracks shard 0, `node1` tracks shard 1 and is its only chunk producer. Stopping `node1`
 * leaves shard 1 without one while `node0` keeps producing blocks on its own — and every one
 * of them counts as another missed chunk for shard 1. The epoch is long enough that the
 * validator set, and with it the chunk producer assignment, is never recomputed here.
 *
 * `alice` sorts before the boundary account `ggggg` and so lives on shard 0, `nat` after it on
 * shard 1: the transaction is signed on the healthy shard and addressed to the stuck one.
 *
 * `Shard.Stuck` deliberately has no `ConversionFailureRegistry` kind of its own and falls to
 * `Client.SendSignedTransaction.Internal` instead: it is transient — the shard recovers once it
 * has a chunk producer again — so a caller gets no actionable use out of a dedicated kind, only
 * a reason to retry, which is the library's job. Kept here and skipped rather than deleted,
 * since building the state below still documents how the node produces it.
 */
describe.skip('signAndSendTransaction › Shard.Stuck conversion error', () => {
  it('fails with Shard.Stuck when the receiving shard has no chunk producer left', {
    timeout: 300_000,
  }, async () => {
    const defaultKeyPair = keyPair(DEFAULT_PRIVATE_KEY);

    const [node0, node1] = await startShardedSandbox({
      validatorStakes: [near('100000'), near('10000')],
      epochLength: 1000,
      // Blocks have to come quickly: the case needs a hundred of them, and each one only
      // waits this long for the approvals of the node that is about to be stopped.
      blockProductionDelayMs: 100,
      maxBlockProductionDelayMs: 400,
    });
    const client = createDefaultClient(node0);

    let node1Running = true;

    try {
      const { accountAccessKey } = await client.getAccountAccessKey({
        accountId: 'alice',
        publicKey: defaultKeyPair.publicKey,
      });

      await node1.stop();
      node1Running = false;

      for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
        const { rawRpcResult } = await client.getBlock({
          blockReference: 'LatestOptimisticBlock',
        });
        const { hash } = (rawRpcResult as unknown as { header: { hash: string } }).header;

        const signedTransaction = await signTransaction({
          signDataProvider: defaultKeyPair,
          transaction: {
            signerAccountId: 'alice',
            signerPublicKey: defaultKeyPair.publicKey,
            // Every attempt needs its own nonce: the first ones are accepted and converted
            // on shard 0, they just never reach `nat`.
            nonce: accountAccessKey.nonce + 1 + attempt,
            blockHash: hash,
            action: transfer({ amount: { near: '1' } }),
            receiverAccountId: 'nat',
          },
        });

        const tx = await client.safeSendSignedTransaction({ signedTransaction });

        // `Shard.Stuck` has no `ConversionFailureRegistry` kind of its own right now, so it
        // surfaces as `Client.SendSignedTransaction.Internal` — peek at the raw nearcore payload
        // to tell it apart from an unrelated internal failure before asserting on it.
        const raw = getUnmappedInvalidTxError(tx) as
          | { ShardStuck: { shardId: number; missedChunks: number } }
          | undefined;

        if (raw?.ShardStuck) {
          const { shardId, missedChunks } = raw.ShardStuck;

          assertUnmappedInvalidTxError(tx, { ShardStuck: { shardId, missedChunks } });

          expect(shardId).toBe(1);
          // The counter keeps growing for as long as the shard has no chunk producer, so only
          // the threshold it had to cross is worth asserting.
          expect(missedChunks).toBeGreaterThanOrEqual(MISSED_CHUNKS_TO_REJECT);
          return;
        }

        await safeSleep(POLL_INTERVAL_MS);
      }

      throw new Error(
        `Shard 1 did not reach ${MISSED_CHUNKS_TO_REJECT} missed chunks within ${
          (POLL_ATTEMPTS * POLL_INTERVAL_MS) / 1000
        }s`,
      );
    } finally {
      await Promise.allSettled(node1Running ? [node0.stop(), node1.stop()] : [node0.stop()]);
    }
  });
});
