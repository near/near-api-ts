import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  addAccessKey,
  type Client,
  createMemoryVault,
  createSigner,
  randomMlDsa65KeyPair,
  transfer,
} from '../../../../../index';
import { createDefaultClient } from '../../../../utils/common';
import { startSandbox } from '../../../../utils/sandbox/startSandbox';

describe('executeTransaction › success', () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  // The node lists an ml-dsa-65 key by its hash, so the signer has to get the
  // full public key back from the vault before it can sign with it
  it('signs and sends a native transfer with an ml-dsa-65 key', async () => {
    const defaultSigner = createSigner({
      signerAccountId: 'nat',
      keyVault: createMemoryVault({ privateKey: DEFAULT_PRIVATE_KEY }),
      client,
    });

    const mlDsa65KeyPair = randomMlDsa65KeyPair();

    await defaultSigner.executeTransaction({
      intent: {
        action: addAccessKey({
          publicKey: mlDsa65KeyPair.publicKey,
          permission: { kind: 'FullAccess' },
          gasPayment: { source: 'AccountBalance' },
        }),
        receiverAccountId: 'nat',
      },
    });

    const mlDsa65Signer = createSigner({
      signerAccountId: 'nat',
      keyVault: createMemoryVault({ privateKey: mlDsa65KeyPair.privateKey }),
      client,
    });

    const tx = await mlDsa65Signer.executeTransaction({
      intent: {
        action: transfer({ amount: { near: '1' } }),
        receiverAccountId: 'bob',
      },
    });

    expect(tx.processingSteps.conversionStep.transactionSummary.signer.publicKey).toBe(
      mlDsa65KeyPair.publicKey,
    );
  });

  it('keeps only the whitelisted ml-dsa-65 key in the pool', async () => {
    const defaultKeyVault = createMemoryVault({
      privateKey: DEFAULT_PRIVATE_KEY,
    });
    const defaultSigner = createSigner({
      signerAccountId: 'nat',
      keyVault: defaultKeyVault,
      client,
    });

    const mlDsa65KeyPair = randomMlDsa65KeyPair();

    await defaultSigner.executeTransaction({
      intent: {
        action: addAccessKey({
          publicKey: mlDsa65KeyPair.publicKey,
          permission: { kind: 'FullAccess' },
          gasPayment: { source: 'AccountBalance' },
        }),
        receiverAccountId: 'nat',
      },
    });

    // The vault holds both keys; the whitelist narrows the pool to the ml-dsa-65 one
    const signer = createSigner({
      signerAccountId: 'nat',
      keyVault: createMemoryVault({
        privateKeys: [DEFAULT_PRIVATE_KEY, mlDsa65KeyPair.privateKey],
      }),
      keyPool: { allowedAccessKeys: [mlDsa65KeyPair.publicKey] },
      client,
    });

    const tx = await signer.executeTransaction({
      intent: {
        action: transfer({ amount: { near: '1' } }),
        receiverAccountId: 'bob',
      },
    });

    expect(tx.processingSteps.conversionStep.transactionSummary.signer.publicKey).toBe(
      mlDsa65KeyPair.publicKey,
    );
  });
});
