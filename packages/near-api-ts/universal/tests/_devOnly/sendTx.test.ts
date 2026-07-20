import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  addFullAccessKey,
  createClient,
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
    // client = createClient({
    //   transport: {
    //     rpcEndpoints: {
    //       archival: [{ url: 'http://localhost:3030' }],
    //     },
    //   },
    // });
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('send tx', async () => {
    const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
      accountId: 'nat',
      publicKey: defaultKeyPair.publicKey,
    });

    const signedTransaction = await signTransaction({
      signDataProvider: defaultKeyPair,
      transaction: {
        signerAccountId: 'nat',
        signerPublicKey: defaultKeyPair.publicKey,
        nonce: accountAccessKey.nonce + 1,
        blockHash,
        actions: [createAccount(), transfer({ amount: { near: '10' } })],
        receiverAccountId: 'abc.nat',
      },
    });

    const tx = await client.safeSendSignedTransaction({
      signedTransaction,
      // minimalProcessingStage: 'ExecutedNearlyFinal',
      // options: {
      //   deserializeResultData: () => 1
      // }
    });
    log(tx);
  });

  it('get tx', async () => {
    const tx = await client.safeGetTransactionResult({
      transactionHash: 'AHouNKfqnMXVNsTZvWMH6UanzNehM6tmuGs5cDwTnp1m',
    });
    log(tx);
  });
});
// tx_hash=FctUgErsrQawXxuFuNbLj4ANHSDxtNzwEioTZNsNGt5D
