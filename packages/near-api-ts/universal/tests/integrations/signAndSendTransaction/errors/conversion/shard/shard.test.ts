import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { type Client, keyPair } from '../../../../../../index';
import type { KeyPair } from '../../../../../../types/_common/keyPairs/keyPair';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';
import { congested } from './congested';

export type TestContext = {
  client: Client;
  defaultKeyPair: KeyPair;
  rpcUrl: string;
};

/**
 * Nothing is wrong with the transaction — the receiving shard can't take it right now. Both
 * `InvalidTxError` variants of the block are mapped to a `ShardErrorRegistry` kind, and both are
 * things a mainnet user can run into, so the cases build the state on purpose: the one below
 * floods a sandbox shard until it stops accepting transactions, which takes about a minute.
 *
 * Its sibling `Shard.Stuck` (100 missed chunks) is covered separately, in `stuck.test.ts`,
 * because it needs a chain whose shard has lost its chunk producer.
 */
describe('signAndSendTransaction › Shard conversion errors', () => {
  const context = {
    defaultKeyPair: keyPair(DEFAULT_PRIVATE_KEY),
  } as TestContext;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    context.client = createDefaultClient(sandbox);
    context.rpcUrl = sandbox.rpcUrl;
    return () => sandbox.stop();
  });

  it(
    'fails with Shard.Congested when the receiving shard is working through a receipt backlog',
    { timeout: 180_000 },
    congested(context),
  );
});
