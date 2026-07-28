import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GenesisAccount, Sandbox } from 'near-sandbox';
import { near } from '../../../../index';
import { safeSleep } from '../../../../src/_common/utils/sleep';

// A `neard` built from nearcore `--features test_features` with the extra
// `ADVERSARY_SKIP_TX_VALIDATION` hook (chain/client/src/rpc_handler.rs). It lets
// an invalid transaction be forced into the mempool and, together with the
// chunk producer running in `ProduceWithoutTxVerification` mode, reach
// `Runtime::apply` and leave a `Failure(InvalidTxError)` outcome on chain.
const MALICIOUS_BINARY_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  'neard-2_13_2-malicious',
);

/**
 * `AdvProduceChunksMode` variants exposed by the adversarial `adv_produce_chunks`
 * RPC (only present in a `test_features` build). Mirrors the enum in nearcore
 * `chain/client/src/chunk_producer.rs`.
 *
 * - `Valid` — normal production.
 * - `StopProduce` — stop producing chunks.
 * - `ProduceWithoutTx` — produce empty chunks.
 * - `ProduceWithoutTxValidityCheck` — skip the tx validity-period check.
 * - `ProduceWithoutTxVerification` — skip runtime verification, so every tx in
 *   the pool (including invalid ones) goes straight into the chunk.
 * - `SkipWindow` — deterministically skip production slots.
 */
export type AdvProduceChunksMode =
  | 'Valid'
  | 'StopProduce'
  | 'ProduceWithoutTx'
  | 'ProduceWithoutTxValidityCheck'
  | 'ProduceWithoutTxVerification'
  | { SkipWindow: { window_size: number; skip_length: number } };

/**
 * Switch the running node's chunk producer into an adversarial mode via the
 * `adv_produce_chunks` JSON-RPC method. Equivalent to:
 *
 * ```
 * curl -s <rpcUrl> -H 'Content-Type: application/json' \
 *   -d '{"jsonrpc":"2.0","id":1,"method":"adv_produce_chunks","params":"ProduceWithoutTxVerification"}'
 * ```
 */
export const setAdvProduceChunksMode = async (rpcUrl: string, mode: AdvProduceChunksMode) => {
  const body = JSON.stringify({
    jsonrpc: '2.0',
    id: 'adv_produce_chunks',
    method: 'adv_produce_chunks',
    params: mode,
  });

  // `Sandbox.start` already waits for `/status` to answer, but give the adv RPC
  // handler a few retries in case it comes up a beat later.
  let lastError: unknown;
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      if (!response.ok) throw new Error(`adv_produce_chunks returned HTTP ${response.status}`);

      const json = (await response.json()) as { error?: unknown };
      if (json.error)
        throw new Error(`adv_produce_chunks RPC error: ${JSON.stringify(json.error)}`);

      return;
    } catch (error) {
      lastError = error;
      await safeSleep(300);
    }
  }

  throw new Error(`Failed to set adversarial chunk-production mode: ${String(lastError)}`);
};

type StartMaliciousSandboxArgs = {
  rpcPort?: number;
  /**
   * Chunk-production mode enabled right after the node becomes ready.
   * Defaults to `'ProduceWithoutTxVerification'` so that invalid transactions
   * forced into the mempool (via `ADVERSARY_SKIP_TX_VALIDATION`) actually make
   * it into a chunk. Pass `'Valid'` to start a plain node and flip the mode
   * later with {@link setAdvProduceChunksMode}.
   */
  advProduceChunksMode?: AdvProduceChunksMode;
};

/**
 * Start a single-node sandbox running the adversarial `neard-2_13_0-malicious`
 * binary, so tests can observe an invalid transaction being included in a chunk.
 *
 * The recipe (matching the manual repro) is two-sided:
 *   1. Launch `neard` with `ADVERSARY_CONSENT=1 ADVERSARY_SKIP_TX_VALIDATION=1`
 *      so `send_tx` skips RPC-side validation and forces the (possibly invalid)
 *      transaction into the mempool.
 *   2. Put the chunk producer into `ProduceWithoutTxVerification` mode so it
 *      skips runtime verification and packs that transaction into a chunk.
 *
 * NOTE: this sets `process.env.NEAR_SANDBOX_BIN_PATH` for the whole process
 * (the only hook `near-sandbox` exposes for choosing the binary). Keep
 * adversarial tests in their own test file so a normal `startSandbox` in the
 * same worker doesn't accidentally pick up the malicious binary.
 */
export const startMaliciousSandbox = async (args?: StartMaliciousSandboxArgs) => {
  // near-sandbox resolves the `neard` binary from NEAR_SANDBOX_BIN_PATH for both
  // `init` and `run`, and the spawned child inherits process.env — which is how
  // the adversarial env vars reach the node.
  process.env.NEAR_SANDBOX_BIN_PATH = MALICIOUS_BINARY_PATH;
  process.env.ADVERSARY_CONSENT = '1';
  process.env.ADVERSARY_SKIP_TX_VALIDATION = '1';

  const sandbox = await Sandbox.start({
    // Ignored because NEAR_SANDBOX_BIN_PATH wins, but it keeps near-sandbox from
    // attempting any download and matches the binary's actual release.
    version: '2.13.2',
    config: {
      rpcPort: args?.rpcPort,
      additionalConfig: {
        // Persist tx execution outcomes so the on-chain Failure(InvalidTxError)
        // stays queryable via tx / EXPERIMENTAL_tx_status.
        save_tx_outcomes: true,
      },
      additionalAccounts: [
        GenesisAccount.createDefault('nat'),
        GenesisAccount.createDefault('alice'),
        GenesisAccount.createDefault('bob'),
        new GenesisAccount(
          'relay',
          'ed25519:AkTn58AmaJcF7L15WqKUUfm8fv5gwzSymHXg3EDRpC44',
          'ed25519:3kDMsPd8EsgPNV2yarJFtKMvCtV4fN4MkwhaW5BXcNx4a2NhMjE8ycVb3Vu1yrhqZc31dCPHNNUYJV3UK9GbFFd6',
          near('10000').yoctoNear,
        ),
      ],
    },
  });

  try {
    await setAdvProduceChunksMode(
      sandbox.rpcUrl,
      args?.advProduceChunksMode ?? 'ProduceWithoutTxVerification',
    );
    return sandbox;
  } catch (error) {
    await sandbox.tearDown();
    throw error;
  }
};
