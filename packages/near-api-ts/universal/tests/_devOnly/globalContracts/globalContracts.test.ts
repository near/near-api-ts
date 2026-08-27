import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  functionCall,
  pinGlobalContract,
  registerGlobalContract,
  signTransaction,
  stake,
} from '../../../index';
import { safeSleep } from '../../../src/createClient/createTransport/createSendRequest/_common/_common/sleep';
import { keyPair } from '../../../src/createMemoryKeyService/toKeyPairs/keyPairs/keyPair/keyPair';
import { randomEd25519KeyPair } from '../../../src/createMemoryKeyService/toKeyPairs/keyPairs/randomEd25519KeyPair';
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

    /*
    wasmUpdatePolicy: 'ByOwner', // 'Never'

    registerGlobalContract({
      wasmU8,
      wasmMutability: 'Mutable', // 'Immutable'
    });

    linkGlobalContract({ globalContractAccountId });
    pinGlobalContract({ globalContractWasmHash });


    ----
   type AccountContract =
  | {
      status: 'NoContract';
    }
  | {
      status: 'Deployed';
      localContractWasmHash: ContractWasmHash;
    }
  | {
      status: 'Pinned';
      globalContractWasmHash: ContractWasmHash;
    }
  | {
      status: 'Linked';
      globalContractAccountId: AccountId;
    };

     */

    const signedTransaction = await signTransaction({
      transaction: {
        signerAccountId: 'nat',
        signerPublicKey: defaultKeyPair.publicKey,
        nonce: natKey.accountAccessKey.nonce + 1,
        blockHash: natKey.blockHash,
        actions: [
          registerGlobalContract({
            wasmU8: await getFileBytes('./wasm/write-get-record.wasm'),
            // wasmMutability: 'Immutable',
            wasmMutability: 'Mutable',
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

    // log(tx1);

    await safeSleep(5000);

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

    await client.safeSendSignedTransaction({
      signedTransaction: signedTransaction2,
      minimalProcessingStage: 'CompletedFinal',
    });
  });
});
