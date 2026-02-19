import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it, vi } from 'vitest';
import * as z from 'zod/mini';
import { addFunctionCallKey, type Client, createAccount, createMemoryKeyService, createMemorySignerFactory, type MemoryKeyService, type MemorySignerFactory, randomEd25519KeyPair, transfer } from '../../../../../../index';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';

z.config(z.locales.en());
vi.setConfig({ testTimeout: 60000 });

describe('MemorySigner.ExecuteTransaction', async () => {
  let client: Client;
  let keyService: MemoryKeyService;
  let createSigner: MemorySignerFactory;

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
    createSigner = createMemorySignerFactory({ client, keyService });
    return () => sandbox.stop();
  });

  it('SigningKeyNotFound', async () => {
    // Create a new user with an FC key
    const nat = await createSigner('nat');

    await nat.executeTransaction({
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

    // Try to sign FA transaction with an FC key
    const user = createSigner('user.nat');

    const tx2 = await user.safeExecuteTransaction({
      intent: {
        action: transfer({ amount: { near: '1' } }),
        receiverAccountId: 'nat',
      },
    });
    assertNatErrKind(
      tx2,
      'MemorySigner.ExecuteTransaction.KeyPool.SigningKey.NotFound',
    );
  });
});
