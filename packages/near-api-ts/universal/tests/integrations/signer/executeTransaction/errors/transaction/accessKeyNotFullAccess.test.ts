import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import * as z from 'zod/mini';
import {
  addAccessKey,
  type Client,
  createMemoryVault,
  createSigner,
  createVaultSignService,
  deleteAccessKey,
  randomEd25519KeyPair,
  transfer,
} from '../../../../../../index';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';

z.config(z.locales.en());
describe('executeTransaction › Signer.AccessKey.NotFullAccess', () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('fails with Rpc.Signer.AccessKey.NotFullAccess when its key lost full access while it runs', async () => {
    const keyPair = randomEd25519KeyPair();
    const intent = {
      action: transfer({ amount: { yoctoNear: '1' } }),
      receiverAccountId: 'nat',
    };

    const nat = createSigner({
      signerAccountId: 'nat',
      client,
      signService: createVaultSignService({
        vault: createMemoryVault({ privateKey: DEFAULT_PRIVATE_KEY }),
      }),
    });

    await nat.executeTransaction({
      intent: {
        action: addAccessKey({
          publicKey: keyPair.publicKey,
          permission: { kind: 'FullAccess' },
          gasPayment: { source: 'AccountBalance' },
        }),
        receiverAccountId: 'nat',
      },
    });

    // A signer with just the new key loads it as a full access key with its first transaction
    const signer = createSigner({
      signerAccountId: 'nat',
      client,
      signService: createVaultSignService({
        vault: createMemoryVault({ privateKey: keyPair.privateKey }),
      }),
    });
    expect((await signer.safeExecuteTransaction({ intent })).success).toBe(true);

    // The same key comes back as a function call key, and the running signer doesn't know it
    await nat.executeTransaction({
      intent: {
        actions: [
          deleteAccessKey({ publicKey: keyPair.publicKey }),
          addAccessKey({
            publicKey: keyPair.publicKey,
            permission: {
              kind: 'ContractFunctionCall',
              allowedContract: 'nat',
              allowedFunctions: 'AllNonPayable',
            },
            gasPayment: { source: 'AccountBalance', allowance: 'Unlimited' },
          }),
        ],
        receiverAccountId: 'nat',
      },
    });

    const tx = await signer.safeExecuteTransaction({ intent });
    assertNatErrKind(tx, 'Signer.ExecuteTransaction.Rpc.Signer.AccessKey.NotFullAccess');
  });
});
