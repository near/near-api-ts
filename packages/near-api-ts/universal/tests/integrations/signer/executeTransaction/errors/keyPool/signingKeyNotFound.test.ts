import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import * as z from 'zod/mini';
import {
  addAccessKey,
  type Client,
  createAccount,
  createMemoryKeyService,
  createMemorySigner,
  type MemoryKeyService,
  randomEd25519KeyPair,
  transfer,
} from '../../../../../../index';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';

z.config(z.locales.en());
describe('executeTransaction › KeyPool.SigningKey.NotFound', async () => {
  let client: Client;
  let keyService: MemoryKeyService;

  const keyPair1 = randomEd25519KeyPair();

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    keyService = createMemoryKeyService({
      keySources: [{ privateKey: DEFAULT_PRIVATE_KEY }, { privateKey: keyPair1.privateKey }],
    });
    return () => sandbox.stop();
  });

  it('fails with KeyPool.SigningKey.NotFound when no key in the pool can sign', async () => {
    // Create a new user with an FC key
    const nat = createMemorySigner({ signerAccountId: 'nat', client, keyService });

    await nat.executeTransaction({
      intent: {
        actions: [
          createAccount(),
          addAccessKey({
            publicKey: keyPair1.publicKey,
            permission: {
              kind: 'FunctionCall',
              allowedContract: 'abc',
              allowedFunctions: 'AllNonPayable',
            },
            gasPayment: { source: 'AccountBalance', allowance: 'Unlimited' },
          }),
          transfer({ amount: { near: '10' } }),
        ],
        receiverAccountId: 'user.nat',
      },
    });

    // Try to sign FA transaction with an FC key
    const user = createMemorySigner({ signerAccountId: 'user.nat', client, keyService });

    // const keys = await client.getAccessKeys({ accountId: 'user.nat' });
    // console.log(keys);

    const tx2 = await user.safeExecuteTransaction({
      intent: {
        action: transfer({ amount: { near: '1' } }),
        receiverAccountId: 'nat',
      },
    });
    assertNatErrKind(tx2, 'MemorySigner.ExecuteTransaction.KeyPool.SigningKey.NotFound');
  });
});
