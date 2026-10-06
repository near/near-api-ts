import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  addAccessKey,
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
import { safeSleep } from '../../src/createClient/createTransport/createSendRequest/_common/_common/sleep';
import { createAccount } from '../../src/transaction/actionCreators/createAccount';
import type { Client } from '../../types/client/client';
import type { MemorySignerFactory } from '../../types/signer/createMemorySigner';
import { createDefaultClient, log } from '../utils/common';
import { getLastNonce } from '../utils/getLastNonce';
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
    const { accessKey, atMomentOf } = await client.getAccessKey({
      accountId: 'nat',
      publicKey: defaultKeyPair.publicKey,
    });

    const randomKp = randomEd25519KeyPair();

    const signedTransaction = await signTransaction({
      signDataProvider: defaultKeyPair,
      transaction: {
        signer: {
          accountId: 'nat',
          publicKey: defaultKeyPair.publicKey,
          replayProtection: { scheme: 'NonceChannel', nonce: getLastNonce(accessKey) + 1 },
        },
        action: addAccessKey({
          publicKey: randomKp.publicKey,
          permission: {
            kind: 'FunctionCall',
            allowedContract: 'abc',
            allowedFunctions: 'AllNonPayable',
          },
          gasPayment: { source: 'KeyBalance' },
          replayProtection: { channelCount: 12 },
        }),
        receiverAccountId: 'nat',
        recentBlockHash: atMomentOf.blockHash,
      },
    });

    const tx = await client.safeSendSignedTransaction({
      signedTransaction,
    });

    log(tx);
  });
});
