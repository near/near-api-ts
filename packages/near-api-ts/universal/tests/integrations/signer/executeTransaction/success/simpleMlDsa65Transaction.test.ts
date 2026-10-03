import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  addAccessKey,
  type Client,
  createMemoryKeyService,
  createMemorySigner,
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
  // full public key back from the key service before it can sign with it
  it('signs and sends a native transfer with an ml-dsa-65 key', async () => {
    const defaultSigner = createMemorySigner({
      signerAccountId: 'nat',
      keyService: createMemoryKeyService({ keySource: { privateKey: DEFAULT_PRIVATE_KEY } }),
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

    const mlDsa65Signer = createMemorySigner({
      signerAccountId: 'nat',
      keyService: createMemoryKeyService({ keySource: mlDsa65KeyPair }),
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
    const defaultKeyService = createMemoryKeyService({
      keySource: { privateKey: DEFAULT_PRIVATE_KEY },
    });
    const defaultSigner = createMemorySigner({
      signerAccountId: 'nat',
      keyService: defaultKeyService,
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

    // The key service holds both keys; the whitelist narrows the pool to the ml-dsa-65 one
    const signer = createMemorySigner({
      signerAccountId: 'nat',
      keyService: createMemoryKeyService({
        keySources: [{ privateKey: DEFAULT_PRIVATE_KEY }, mlDsa65KeyPair],
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
