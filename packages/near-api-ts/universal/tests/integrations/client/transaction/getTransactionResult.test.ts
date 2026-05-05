import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  type Client,
  createClient,
  createMemoryKeyService,
  createMemorySigner,
  type MemoryKeyService,
  transfer,
} from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';
import { createDefaultClient, log } from '../../../utils/common';
import { startSandbox } from '../../../utils/sandbox/startSandbox';
import { startShardedSandbox } from '../../../utils/sandbox/startShardedSandbox';

vi.setConfig({ testTimeout: 60000 });

describe('getTransactionResult', () => {
  let clientS0: Client;
  let clientS1: Client;

  beforeAll(async () => {
    const [node0, node1] = await startShardedSandbox();
    clientS0 = createDefaultClient(node0);
    clientS1 = createDefaultClient(node1);
    return () => {
      node0.stop();
      node1.stop();
    };
  });

  it('get account info', async () => {
    log(['node0 → near', await clientS0.safeGetAccountAccessKeys({ accountId: 'near' })]);
    log(['node1 → near', await clientS1.safeGetAccountAccessKeys({ accountId: 'near' })]);
  });
});
