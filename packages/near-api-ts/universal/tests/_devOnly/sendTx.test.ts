import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  addFullAccessKey,
  createClient,
  createMemoryKeyService,
  createMemorySignerFactory,
  createTestnetClient,
  deployContract,
  functionCall,
  keyPair,
  near,
  randomEd25519KeyPair,
  safeSignTransaction,
  signTransaction,
  stake,
  transfer,
} from '../../index';
import { createAccount } from '../../src/actionCreators/createAccount';
import { safeSleep } from '../../src/createClient/transport/sendRequest/_common/_common/sleep';
import type { Client } from '../../types/client/client';
import type { MemorySignerFactory } from '../../types/signer/createMemorySigner';
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

  it('send tx', async () => {
    const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
      accountId: 'nat',
      publicKey: defaultKeyPair.publicKey,
    });

    const randomKp = randomEd25519KeyPair();

    const signedTransaction = await signTransaction({
      signDataProvider: defaultKeyPair,
      transaction: {
        signerAccountId: 'nat',
        signerPublicKey: defaultKeyPair.publicKey,
        nonce: accountAccessKey.nonce + 1,
        blockHash,
        action: stake({ amount: { near: '0' }, validatorPublicKey: randomKp.publicKey }),
        receiverAccountId: 'nat',
      },
    });

    const tx = await client.safeSendSignedTransaction({
      signedTransaction,
    });

    if (tx.ok) {
      const x = tx.value;
    }

    log(tx);
  });
});
