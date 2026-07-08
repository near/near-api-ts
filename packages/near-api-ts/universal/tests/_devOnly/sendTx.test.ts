import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  addFullAccessKey,
  createMemoryKeyService,
  createMemorySignerFactory,
  deployContract,
  functionCall,
  keyPair,
  near,
  signTransaction,
  transfer,
} from '../../index';
import { safeSleep } from '../../src/_common/utils/sleep';
import { createAccount } from '../../src/helpers/actionCreators/createAccount';
import type { Client } from '../../types/client/client';
import type { MemorySignerFactory } from '../../types/signers/memorySigner/public/createMemorySigner';
import { createDefaultClient, log } from '../utils/common';
import { startSandbox } from '../utils/sandbox/startSandbox';

describe('SendTx', () => {
  let client: Client;
  let createSigner: MemorySignerFactory;
  const defaultKeyPair = keyPair(DEFAULT_PRIVATE_KEY);

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    const keyService = createMemoryKeyService({
      keySources: [{ privateKey: DEFAULT_PRIVATE_KEY }],
    });
    createSigner = createMemorySignerFactory({ client, keyService });
    return () => sandbox.stop();
  });

  it('Ok', async () => {
    const nat = createSigner('nat');

    await nat.executeTransaction({
      intent: {
        actions: [
          createAccount(),
          addFullAccessKey(defaultKeyPair),
          transfer({ amount: near('2') }),
        ],
        receiverAccountId: 'new.nat',
      },
    });
    await safeSleep(600);

    // Try to send  2 txs in the same time
    const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
      accountId: 'new.nat',
      publicKey: defaultKeyPair.publicKey,
    });

    const signedTransaction1 = await signTransaction({
      signDataProvider: defaultKeyPair,
      transaction: {
        signerAccountId: 'new.nat',
        signerPublicKey: defaultKeyPair.publicKey,
        nonce: accountAccessKey.nonce + 1,
        blockHash,
        actions: [transfer({ amount: { near: '1' } })],
        receiverAccountId: 'nat',
      },
    });

    const signedTransaction2 = await signTransaction({
      signDataProvider: defaultKeyPair,
      transaction: {
        signerAccountId: 'new.nat',
        signerPublicKey: defaultKeyPair.publicKey,
        nonce: accountAccessKey.nonce + 2,
        blockHash,
        actions: [transfer({ amount: { near: '1' } })],
        receiverAccountId: 'nat',
      },
    });

    const txs = await Promise.all([
      client.safeSendSignedTransaction({ signedTransaction: signedTransaction1 }),
      client.safeSendSignedTransaction({ signedTransaction: signedTransaction2 }),
    ]);
    log(txs);

    await safeSleep(1000);

    const txRes1 = await client.safeGetTransactionResult({
      transactionHash: signedTransaction1.transactionHash,
    });
    log(`txRes1`);
    log(txRes1);

    const txRes2 = await client.safeGetTransactionResult({
      transactionHash: signedTransaction2.transactionHash,
    });
    log(`txRes2`);
    log(txRes2);
  });
});
