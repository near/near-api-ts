import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  addAccessKey,
  type Client,
  createAccount,
  createMemoryKeyService,
  type MemoryKeyService,
  randomMlDsa65KeyPair,
  transfer,
} from '../../../../index';
import { signTransaction } from '../../../../src/transaction/signTransaction/signTransaction';
import { createDefaultClient } from '../../../utils/common';
import { getLastNonce } from '../../../utils/getLastNonce';
import { startSandbox } from '../../../utils/sandbox/startSandbox';

vi.setConfig({ testTimeout: 120000, hookTimeout: 120000 });

describe('ml-dsa-65 Transaction success', () => {
  let client: Client;
  let keyService: MemoryKeyService;

  // Post-quantum key generated at runtime — no 5.5 KB fixture literal.
  const mlDsa65KeyPair = randomMlDsa65KeyPair();
  const newAccountId = 'mldsa.nat';

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    keyService = createMemoryKeyService({
      keySources: [{ privateKey: DEFAULT_PRIVATE_KEY }, { privateKey: mlDsa65KeyPair.privateKey }],
    });
    return () => sandbox.stop();
  });

  it('creates an ml-dsa-65 account and transfers signed by it', async () => {
    // Tx 1 — signed by `nat` (ed25519 default key): create `mldsa.nat`, fund it,
    // and register the ml-dsa-65 key as a full-access key.
    const natAccessKey = await client.getAccessKey({
      accountId: 'nat',
      publicKey: DEFAULT_PUBLIC_KEY,
    });

    const createTx = await signTransaction({
      signDataProvider: keyService,
      transaction: {
        signer: {
          accountId: 'nat',
          publicKey: DEFAULT_PUBLIC_KEY,
          replayProtection: {
            scheme: 'NonceChannel',
            nonce: getLastNonce(natAccessKey.accessKey) + 1,
          },
        },
        recentBlockHash: natAccessKey.atMomentOf.blockHash,
        receiverAccountId: newAccountId,
        actions: [
          createAccount(),
          transfer({ amount: { near: '10' } }),
          addAccessKey({
            publicKey: mlDsa65KeyPair.publicKey,
            permission: { kind: 'FullAccess' },
            gasPayment: { source: 'AccountBalance' },
          }),
        ],
      },
    });

    await expect(
      client.sendSignedTransaction({ signedTransaction: createTx }),
    ).resolves.toMatchObject({
      status: 'ExecutionSuccess',
    });

    // Tx 2 — signed by the ml-dsa-65 key itself: proves on-chain sign/verify.
    const mlDsa65AccessKey = await client.getAccessKey({
      accountId: newAccountId,
      publicKey: mlDsa65KeyPair.publicKey,
    });

    const transferTx = await signTransaction({
      signDataProvider: keyService,
      transaction: {
        signer: {
          accountId: newAccountId,
          publicKey: mlDsa65KeyPair.publicKey,
          replayProtection: {
            scheme: 'NonceChannel',
            nonce: getLastNonce(mlDsa65AccessKey.accessKey) + 1,
          },
        },
        recentBlockHash: mlDsa65AccessKey.atMomentOf.blockHash,
        receiverAccountId: 'bob',
        action: transfer({ amount: { near: '1' } }),
      },
    });

    await expect(
      client.sendSignedTransaction({ signedTransaction: transferTx }),
    ).resolves.toMatchObject({
      status: 'ExecutionSuccess',
    });
  });
});
