import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  addFullAccessKey,
  type Client,
  createAccount,
  createMemoryKeyService,
  type MemoryKeyService,
  randomMlDsa65KeyPair,
  transfer,
} from '../../../../index';
import { signTransaction } from '../../../../src/helpers/signTransaction';
import { createDefaultClient } from '../../../utils/common';
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
    const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
      accountId: 'nat',
      publicKey: DEFAULT_PUBLIC_KEY,
    });

    const createTx = await signTransaction({
      signDataProvider: keyService,
      transaction: {
        signerAccountId: 'nat',
        signerPublicKey: DEFAULT_PUBLIC_KEY,
        nonce: accountAccessKey.nonce + 1,
        blockHash,
        receiverAccountId: newAccountId,
        actions: [
          createAccount(),
          transfer({ amount: { near: '10' } }),
          addFullAccessKey({ publicKey: mlDsa65KeyPair.publicKey }),
        ],
      },
    });

    await expect(
      client.sendSignedTransaction({ signedTransaction: createTx }),
    ).resolves.toMatchObject({
      rawRpcResult: {
        status: { SuccessValue: '' },
      },
    });

    // Tx 2 — signed by the ml-dsa-65 key itself: proves on-chain sign/verify.
    const { accountAccessKey: mlDsa65AccessKey, blockHash: mlDsa65BlockHash } =
      await client.getAccountAccessKey({
        accountId: newAccountId,
        publicKey: mlDsa65KeyPair.publicKey,
      });

    const transferTx = await signTransaction({
      signDataProvider: keyService,
      transaction: {
        signerAccountId: newAccountId,
        signerPublicKey: mlDsa65KeyPair.publicKey,
        nonce: mlDsa65AccessKey.nonce + 1,
        blockHash: mlDsa65BlockHash,
        receiverAccountId: 'bob',
        action: transfer({ amount: { near: '1' } }),
      },
    });

    await expect(
      client.sendSignedTransaction({ signedTransaction: transferTx }),
    ).resolves.toMatchObject({
      rawRpcResult: {
        status: { SuccessValue: '' },
      },
    });
  });
});
