import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { functionCall, registerGlobalContract, signTransaction, stake } from '../../../index';
import { keyPair } from '../../../src/createMemoryKeyService/toKeyPairs/keyPairs/keyPair/keyPair';
import type { Client } from '../../../types/client/client';
import { createDefaultClient, getFileBytes, log } from '../../utils/common';
import { startSandbox } from '../../utils/sandbox/startSandbox';

describe('DeployContract Tests', () => {
  let client: Client;
  const defaultKeyPair = keyPair(DEFAULT_PRIVATE_KEY);

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('deployTheSameContract.test', async () => {
    const natKey = await client.getAccountAccessKey({
      accountId: 'nat',
      publicKey: defaultKeyPair.publicKey,
    });

    const signedTransaction = await signTransaction({
      transaction: {
        signerAccountId: 'nat',
        signerPublicKey: defaultKeyPair.publicKey,
        nonce: natKey.accountAccessKey.nonce + 1,
        blockHash: natKey.blockHash,
        actions: [
          registerGlobalContract({
            wasmU8: await getFileBytes('./wasm/write-get-record.wasm'),
            wasmMutability: 'Immutable',
          }),
        ],
        receiverAccountId: 'nat',
      },
      signDataProvider: defaultKeyPair,
    });

    await client.safeSendSignedTransaction({
      signedTransaction,
      minimalProcessingStage: 'CompletedFinal',
    });

    const natInfo = await client.getAccountInfo({ accountId: 'nat' });
    log(natInfo);

    // 2. Try to use it
    const aliceKey = await client.getAccountAccessKey({
      accountId: 'alice',
      publicKey: defaultKeyPair.publicKey,
    });

    const signedTransaction2 = await signTransaction({
      transaction: {
        signerAccountId: 'alice',
        signerPublicKey: defaultKeyPair.publicKey,
        nonce: aliceKey.accountAccessKey.nonce + 1,
        blockHash: aliceKey.blockHash,
        actions: [
          registerGlobalContract({
            wasmU8: await getFileBytes('./wasm/write-get-record.wasm'),
            wasmMutability: 'Immutable',
          }),
        ],
        receiverAccountId: 'alice',
      },
      signDataProvider: defaultKeyPair,
    });

    await client.safeSendSignedTransaction({
      signedTransaction: signedTransaction2,
      minimalProcessingStage: 'CompletedFinal',
    });

    const aliceInfo = await client.getAccountInfo({ accountId: 'alice' });
    log(aliceInfo);
  });
});
