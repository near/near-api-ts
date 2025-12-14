import * as z from 'zod/mini';
import { vi, expect, it, describe, beforeAll } from 'vitest';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';
import {
  addFunctionCallKey,
  type Client,
  createAccount,
  createMemoryKeyService,
  createMemorySigner,
  createMemorySignerFactory,
  type MemoryKeyService,
  type MemorySignerFactory,
  randomEd25519KeyPair,
  transfer,
} from '../../../../../../src';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { createDefaultClient } from '../../../../../utils/common';

z.config(z.locales.en());
vi.setConfig({ testTimeout: 60000 });

describe('MemorySigner.ExecuteTransaction', async () => {
  let client: Client;
  let keyService: MemoryKeyService;
  let createSigner: MemorySignerFactory;

  const keyPair1 = randomEd25519KeyPair();

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = await createDefaultClient(sandbox);

    keyService = await createMemoryKeyService({
      keySources: [
        { privateKey: DEFAULT_PRIVATE_KEY },
        { privateKey: keyPair1.privateKey },
      ],
    });
    createSigner = createMemorySignerFactory({ client, keyService });

    return () => sandbox.stop();
  });

  it('KeyForTaskNotFound', async () => {
    // Create new user with FC key
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

    // Try to sign FA transaction with FC key
    const user = await createSigner('user.nat');

    const tx2 = await user.safeExecuteTransaction({
      intent: {
        action: transfer({ amount: { near: '1' } }),
        receiverAccountId: 'nat',
      },
    });
    assertNatErrKind(tx2, 'MemorySigner.ExecuteTransaction.KeyForTaskNotFound');
  });
});
