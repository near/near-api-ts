import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import * as z from 'zod/mini';
import {
  addAccessKey,
  type Client,
  createMemoryVault,
  createSigner,
  createSubAccount,
  createVaultSignService,
  randomEd25519KeyPair,
  transfer,
} from '../../../../../../index';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';

z.config(z.locales.en());
describe('executeTransaction › KeyPool.Empty', async () => {
  let client: Client;

  const gasKeyPair = randomEd25519KeyPair();
  const intent = {
    action: transfer({ amount: { yoctoNear: '1' } }),
    receiverAccountId: 'nat',
  };

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);

    // Create a user whose only key is a gas key - one paid from its own balance
    const nat = createSigner({
      signerAccountId: 'nat',
      client,
      signService: createVaultSignService({
        vault: createMemoryVault({ privateKey: DEFAULT_PRIVATE_KEY }),
      }),
    });

    await nat.executeTransaction({
      intent: {
        actions: [
          createSubAccount(),
          transfer({ amount: { near: '10' } }),
          addAccessKey({
            publicKey: gasKeyPair.publicKey,
            permission: { kind: 'FullAccess' },
            gasPayment: { source: 'KeyBalance' },
            replayProtection: { channelCount: 1 },
          }),
        ],
        receiverAccountId: 'gas.nat',
      },
    });

    return () => sandbox.stop();
  });

  it('fails with KeyPool.Empty when the sign service holds none of the account keys', async () => {
    const nat = createSigner({
      signerAccountId: 'nat',
      client,
      signService: createVaultSignService({ vault: createMemoryVault() }),
    });

    const tx = await nat.safeExecuteTransaction({ intent });
    assertNatErrKind(tx, 'Signer.ExecuteTransaction.KeyPool.Empty');
  });

  it('fails with KeyPool.Empty when the only key the sign service holds is a gas key', async () => {
    const user = createSigner({
      signerAccountId: 'gas.nat',
      client,
      signService: createVaultSignService({
        vault: createMemoryVault({ privateKey: gasKeyPair.privateKey }),
      }),
    });

    const tx = await user.safeExecuteTransaction({ intent });
    assertNatErrKind(tx, 'Signer.ExecuteTransaction.KeyPool.Empty');
  });

  it('fails with KeyPool.Empty when allowedAccessKeys leaves out every account key', async () => {
    const nat = createSigner({
      signerAccountId: 'nat',
      client,
      signService: createVaultSignService({
        vault: createMemoryVault({ privateKey: DEFAULT_PRIVATE_KEY }),
      }),
      keyPool: { allowedAccessKeys: [randomEd25519KeyPair().publicKey] },
    });

    const tx = await nat.safeExecuteTransaction({ intent });
    assertNatErrKind(tx, 'Signer.ExecuteTransaction.KeyPool.Empty');
  });
});
