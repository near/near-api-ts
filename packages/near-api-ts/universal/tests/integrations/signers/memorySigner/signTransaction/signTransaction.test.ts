import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import * as z from 'zod/mini';
import { addFunctionCallKey, type Client, createAccount, createMemoryKeyService, createMemorySigner, type MemoryKeyService, randomEd25519KeyPair, transfer } from '../../../../../index';
import { assertNatErrKind } from '../../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../../utils/common';
import { startSandbox } from '../../../../utils/sandbox/startSandbox';

z.config(z.locales.en());
vi.setConfig({ testTimeout: 60000 });

describe('MemorySigner.signTransaction', async () => {
  let client: Client;
  let keyService: MemoryKeyService;

  const keyPair1 = randomEd25519KeyPair();

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    keyService = createMemoryKeyService({
      keySources: [
        { privateKey: DEFAULT_PRIVATE_KEY },
        { privateKey: keyPair1.privateKey },
      ],
    });
    return () => sandbox.stop();
  });

  it('Default Ok', async () => {
    const signer = createMemorySigner({
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
    expect(tx.ok).toBe(true);
  });

  it('KeyPool.SigningKey.NotFound', async () => {
    // Create a new user with an FC key
    const nat = createMemorySigner({
      signerAccountId: 'nat',
      client,
      keyService,
    });

    const tx1 = await nat.signTransaction({
      intent: {
        actions: [
          createAccount(),
          addFunctionCallKey({
            publicKey: keyPair1.publicKey,
            contractAccountId: 'abc',
          }),
          transfer({ amount: { near: '10' } }),
        ],
        receiverAccountId: 'user.nat',
      },
    });
    await client.sendSignedTransaction({ signedTransaction: tx1 });

    // Try to sign FA transaction with an FC key
    const user = createMemorySigner({
      signerAccountId: 'user.nat',
      client,
      keyService,
    });

    const tx2 = await user.safeSignTransaction({
      intent: {
        action: transfer({ amount: { near: '1' } }),
        receiverAccountId: 'nat',
      },
    });
    assertNatErrKind(tx2, 'MemorySigner.SignTransaction.KeyPool.SigningKey.NotFound');
  });
});
