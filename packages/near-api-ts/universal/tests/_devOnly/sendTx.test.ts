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
  const defaultKeyPair = keyPair(DEFAULT_PRIVATE_KEY);

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('test', async () => {
    const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
      accountId: 'nat',
      publicKey: defaultKeyPair.publicKey,
    });

    const signedTransaction = await signTransaction({
      signDataProvider: defaultKeyPair,
      transaction: {
        signerAccountId: 'new.nat',
        signerPublicKey: defaultKeyPair.publicKey,
        nonce: accountAccessKey.nonce + 1,
        blockHash,
        actions: [transfer({ amount: { near: '1' } })],
        receiverAccountId: '123',
      },
    });

    const tx = await client.safeSendSignedTransaction(signedTransaction);
    log(tx);
  });
});
