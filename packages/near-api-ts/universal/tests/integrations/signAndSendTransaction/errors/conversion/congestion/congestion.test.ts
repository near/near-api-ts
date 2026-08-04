import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { type Client, keyPair } from '../../../../../../index';
import type { KeyPair } from '../../../../../../types/_common/keyPairs/keyPair';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';
import { shardCongested } from './shardCongested';

export type TestContext = {
  client: Client;
  defaultKeyPair: KeyPair;
  rpcUrl: string;
};

/**
 * Congestion control errors: the node turns a transaction down because of the state of the
 * receiving shard rather than anything about the transaction itself. Both of them are things
 * a mainnet user can run into, so the case below builds the condition on purpose — it floods
 * a sandbox shard until it stops accepting transactions, which takes about a minute.
 *
 * Its sibling `ShardStuck` (100 missed chunks) is covered separately, in `shardStuck.test.ts`,
 * because it needs a chain whose shard has lost its chunk producer.
 */
describe('signAndSendTransaction › Congestion conversion errors', () => {
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
    'fails with ShardCongested when the receiving shard is working through a receipt backlog',
    { timeout: 180_000 },
    shardCongested(context),
  );
});
