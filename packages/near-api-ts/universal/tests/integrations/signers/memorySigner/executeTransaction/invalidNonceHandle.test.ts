import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import * as z from 'zod/mini';
import { type Client, createMemoryKeyService, createMemorySigner, type MemoryKeyService, transfer } from '../../../../../index';
import { createDefaultClient } from '../../../../utils/common';
import { startSandbox } from '../../../../utils/sandbox/startSandbox';

z.config(z.locales.en());
vi.setConfig({ testTimeout: 60000 });

describe('MemorySigner.executeTransaction', async () => {
  let client: Client;
  let keyService: MemoryKeyService;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    keyService = createMemoryKeyService({
      keySources: [{ privateKey: DEFAULT_PRIVATE_KEY }],
    });
    return () => sandbox.stop();
  });

  // Create 2 signers of the same account (don't do it in the prod - for test only)
  it('Invalid nonce handled', async () => {
    const nat1 = createMemorySigner({
      signerAccountId: 'nat',
      client,
      keyService,
    });

    const nat2 = createMemorySigner({
      signerAccountId: 'nat',
      client,
      keyService,
    });

    // Make sure send another TX - if you will send the same with invalid nonce,
    // rpc will just return a prev tx result;
    const tx1 = await nat1.safeExecuteTransaction({
      intent: {
        action: transfer({ amount: { near: '2' } }),
        receiverAccountId: 'alice',
      },
    });
    expect(tx1.ok).toBe(true);

    // The first try will fail, then it will update the nonce and resend
    const tx2 = await nat2.safeExecuteTransaction({
      intent: {
        action: transfer({ amount: { near: '1' } }),
        receiverAccountId: 'bob',
      },
    });
    expect(tx2.ok).toBe(true);
  });
});
