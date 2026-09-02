import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  functionCall,
  linkGlobalContract,
  pinGlobalContract,
  registerGlobalContract,
  signTransaction,
} from '../../../index';
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

  it('deploy', async () => {
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

    const tx1 = await client.safeSendSignedTransaction({
      signedTransaction,
      minimalProcessingStage: 'CompletedFinal',
    });
    log(tx1);

    // 2. Try to use it
    const signedTransaction2 = await signTransaction({
      transaction: {
        signerAccountId: 'nat',
        signerPublicKey: defaultKeyPair.publicKey,
        nonce: natKey.accountAccessKey.nonce + 2,
        blockHash: natKey.blockHash,
        actions: [
          pinGlobalContract({
            globalContractWasmHash: 'D6noZ3aDk5ZwPSqp2p8P85dpEg9xhfqKSCo5cniDLkHK',
          }),
          functionCall({
            functionName: 'write_record',
            functionArgs: { record_id: 1, record: 'Hi Alice' },
            gasLimit: { teraGas: '20' },
          }),
        ],
        receiverAccountId: 'nat',
      },
      signDataProvider: defaultKeyPair,
    });

    const tx2 = await client.safeSendSignedTransaction({
      signedTransaction: signedTransaction2,
      minimalProcessingStage: 'CompletedFinal',
    });
    log(tx2);

    const info = await client.getAccountInfo({ accountId: 'nat' });
    log(info);

    // registerGlobalContract({
    //   wasmU8: new Uint8Array(),
    //   wasmMutability: 'Immutable', // Mutable
    // });
    //
    // pinGlobalContract({ globalContractWasmHash: 'D6noZ3aDk5ZwPSqp2p8P85dpEg9xhfqKSCo5cniDLkHK' });
    // linkGlobalContract({ globalContractAccountId: 'nat' });
    //
    // const { contract } = await client.getAccountInfo({ accountId: 'nat' });
    // // { status: 'NoContract' }
    // // | { status: 'Deployed', localContractWasmHash }
    // // | { status: 'Pinned',   globalContractWasmHash }
    // // | { status: 'Linked',   globalContractAccountId }
  });
});
