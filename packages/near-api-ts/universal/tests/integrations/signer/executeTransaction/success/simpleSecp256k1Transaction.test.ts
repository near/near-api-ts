import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  addAccessKey,
  type Client,
  createMemoryVault,
  createSigner,
  createVaultSignService,
  randomSecp256k1KeyPair,
  transfer,
} from '../../../../../index';
import { createDefaultClient, log } from '../../../../utils/common';
import { startSandbox } from '../../../../utils/sandbox/startSandbox';

describe('executeTransaction › success', () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('signs and sends a native transfer with a secp256k1 key', async () => {
    const keyVault1 = createMemoryVault({
      privateKey: DEFAULT_PRIVATE_KEY,
    });

    const signer1 = createSigner({
      signerAccountId: 'nat',
      signService: createVaultSignService({ vault: keyVault1 }),
      client,
    });

    const secp256k1KeyPair = randomSecp256k1KeyPair();

    await signer1.executeTransaction({
      intent: {
        action: addAccessKey({
          publicKey: secp256k1KeyPair.publicKey,
          permission: { kind: 'FullAccess' },
          gasPayment: { source: 'AccountBalance' },
        }),
        receiverAccountId: signer1.signerAccountId,
      },
    });

    const keyVault2 = createMemoryVault({ privateKey: secp256k1KeyPair.privateKey });

    const signer2 = createSigner({
      signerAccountId: 'nat',
      signService: createVaultSignService({ vault: keyVault2 }),
      client,
    });

    const tx = await signer2.executeTransaction({
      intent: {
        action: transfer({ amount: { near: '1' } }),
        receiverAccountId: 'bob',
      },
    });

    log(tx);
  });
});
