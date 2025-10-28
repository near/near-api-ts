import { expect, test } from 'vitest';
import {
  createClient,
  createMemoryKeyService,
  createMemorySigner,
  transfer,
  addFunctionCallKey,
  addFullAccessKey,
  createAccount,
  deployContract,
  functionCall,
  type MemorySigner,
} from '../../../src';
import { getFileBytes, log } from '../utils/common';
import { withSandbox } from '../utils/sandbox/startSandbox';
import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { testKeys } from '../utils/testKeys';
import type { Client, MemoryKeyService } from '../../../src';

/*
    1. Setup demo contract with set/get record
    2. Create user.nat with FC key
    3. Try to send s
 */

const setupNat = async (rpcUrl: string) => {
  const client = await createClient({
    transport: {
      rpcEndpoints: { regular: [{ url: rpcUrl }] },
    },
  });

  const keyService = await createMemoryKeyService({
    keySources: [
      { privateKey: DEFAULT_PRIVATE_KEY },
      { privateKey: testKeys.fc.forContract.privateKey },
    ],
  });

  const nat = await createMemorySigner({
    signerAccountId: 'nat',
    client,
    keyService,
  });

  return { client, keyService, nat };
};

const createContract = async (nat: MemorySigner) => {
  const result = await nat.executeTransaction({
    actions: [
      createAccount(),
      transfer({ amount: { near: '100' } }),
      addFullAccessKey({
        publicKey: DEFAULT_PUBLIC_KEY,
      }),
      deployContract({
        wasmBytes: await getFileBytes('../wasm/write-get-record.wasm'),
      }),
      functionCall({
        functionName: 'write_record',
        functionArgs: {
          record_id: 0,
          record: 'Hello',
        },
        gasLimit: { teraGas: '10' },
      }),
    ],
    receiverAccountId: 'contract.nat',
  });
  // log(result);
};

const createUser = async (nat: MemorySigner) => {
  const result = await nat.executeTransaction({
    actions: [
      createAccount(),
      transfer({ amount: { near: '100' } }),
      addFullAccessKey({
        publicKey: DEFAULT_PUBLIC_KEY,
      }),
      addFunctionCallKey({
        publicKey: testKeys.fc.forContract.publicKey,
        contractAccountId: 'contract.nat',
        // gasBudget: { yoctoNear: '100' },
      }),
    ],
    receiverAccountId: 'user.nat',
  });
  // log(result);
};

const testFn = async (args: { rpcUrl: string }) => {
  const { client, keyService, nat } = await setupNat(args.rpcUrl);

  await createContract(nat);
  await createUser(nat);

  // const res = await client.callContractReadFunction({
  //   contractAccountId: 'contract.nat',
  //   functionName: 'get_record',
  //   functionArgs: { record_id: 0 },
  // });
  //
  // console.log(res);

  const user = await createMemorySigner({
    signerAccountId: 'user.nat',
    keyPool: {
      signingKeys: [testKeys.fc.forContract.publicKey],
    },
    client,
    keyService,
  });

  try {
    const tx1 = await user.executeTransaction({
      action: functionCall({
        functionName: 'write_record',
        functionArgs: {
          record_id: 0,
          record: 'World',
        },
        gasLimit: { teraGas: '10' },
      }),
      receiverAccountId: 'contract.nat',
    });

    log(tx1);
  } catch (e) {
    log(e);
  }
};

test(
  'Insufficient function call key gasLimit',
  {
    timeout: 30 * 1000,
  },
  async () => withSandbox(testFn),
);
