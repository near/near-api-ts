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

    const randomKp = randomEd25519KeyPair();

    const signedTransaction = await signTransaction({
      signDataProvider: randomKp,
      transaction: {
        signerAccountId: 'nat',
        signerPublicKey: randomKp.publicKey,
        nonce: accountAccessKey.nonce + 1,
        blockHash,
        actions: [createAccount(), transfer({ amount: { near: '10' } })],
        receiverAccountId: 'abc.nat2',
      },
    });

    const tx = await client.safeSendSignedTransaction({
      signedTransaction,
      // minimalProcessingStage: 'CompletedFinal',
      // options: {
      //   deserializeActionSummaries: () => [1],
      // },
    });

    if (tx.ok) {
      const x = tx.value;
    }

    if (!tx.ok) {
      const x = tx.error;
      if (tx.error.kind === 'Client.SendSignedTransaction.Rpc.Expired') {
        const x3 = tx.error;
      }

      if (tx.error.kind === 'Client.SendSignedTransaction.Rpc.Action.AddKey.AlreadyExists') {
        const x4 = tx.error;
      }

      if (tx.error.kind === 'Client.SendSignedTransaction.Rpc.Signer.NotFound') {
        const x5 = tx.error.context;
      }
    }

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
