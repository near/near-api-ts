import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import * as z from 'zod/mini';
import {
  type Client,
  createMemoryVault,
  createSigner,
  type MemoryVault,
  transfer,
} from '../../../../index';
import { createDefaultClient } from '../../../utils/common';
import { startSandbox } from '../../../utils/sandbox/startSandbox';

z.config(z.locales.en());
describe('Signer.executeTransaction', async () => {
  let client: Client;
  let keyVault: MemoryVault;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    keyVault = createMemoryVault({
      privateKeys: [DEFAULT_PRIVATE_KEY],
    });
    return () => sandbox.stop();
  });

  // Create 2 signers of the same account (don't do it in the prod - for test only)
  it('Invalid nonce handled', async () => {
    const nat1 = createSigner({
      signerAccountId: 'nat',
      client,
      keyVault,
    });

    const nat2 = createSigner({
      signerAccountId: 'nat',
      client,
      keyVault,
    });

    // Make sure send another TX - if you will send the same with invalid nonce,
    // rpc will just return a prev tx result;
    const tx1 = await nat1.safeExecuteTransaction({
      intent: {
        action: transfer({ amount: { near: '2' } }),
        receiverAccountId: 'alice',
      },
    });
    expect(tx1.success).toBe(true);

    // The first try will fail, then it will update the nonce and resend
    const tx2 = await nat2.safeExecuteTransaction({
      intent: {
        action: transfer({ amount: { near: '1' } }),
        receiverAccountId: 'bob',
      },
    });
    expect(tx2.success).toBe(true);
  });
});
