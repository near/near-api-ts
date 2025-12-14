import * as z from 'zod/mini';
import { vi, expect, it, describe, beforeAll } from 'vitest';
import { startSandbox } from '../../../utils/sandbox/startSandbox';
import {
  type Client,
  createMemoryKeyService,
  createMemorySigner,
  type MemoryKeyService,
} from '../../../../src';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';
import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { createDefaultClient } from '../../../utils/common';

z.config(z.locales.en());
vi.setConfig({ testTimeout: 60000 });

describe('MemorySigner.signTransaction', async () => {
  let client: Client;
  let keyService: MemoryKeyService;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = await createDefaultClient(sandbox);
    keyService = await createMemoryKeyService({
      keySources: [{ privateKey: DEFAULT_PRIVATE_KEY }],
    });
    return () => sandbox.stop();
  });

  it('Default Ok', async () => {
    const signer = await createMemorySigner({
      signerAccountId: 'nat',
      client,
      keyService,
    });

    const tx = await signer.safeSignTransaction({
      intent: {
        action: {
          actionType: 'Transfer',
          amount: { near: '15' },
        },
        receiverAccountId: 'bob',
      },
    });
    // signer.stop();
    expect(tx.ok).toBe(true);
  });
});
