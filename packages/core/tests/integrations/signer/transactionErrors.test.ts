import { test } from 'vitest';
import {
  safeCreateClient,
  createMemoryKeyService,
  transfer,
  addFullAccessKey,
  createAccount,
  deployContract,
  functionCall,
} from '../../../src';
import { getFileBytes, log } from '../../utils/common';
import { withSandbox } from '../../utils/sandbox/startSandbox';
import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { testKeys } from '../../utils/testKeys';

const testFn = async (args: { rpcUrl: string }) => {
  try {
    const client = await safeCreateClient({
      transport: {
        rpcEndpoints: { regular: [{ url: args.rpcUrl }] },
      },
    });

    const keyService = await createMemoryKeyService({
      keySources: [
        { privateKey: DEFAULT_PRIVATE_KEY },
        { privateKey: testKeys.fc.forContract.privateKey },
      ],
    });

    const { accountKey, blockHash } = await client.getAccountKey({
      accountId: 'nat',
      publicKey: DEFAULT_PUBLIC_KEY,
    });
    // signerPublicKey: testKeys.fc.forContract.publicKey,

    // const x = await keyService.signTransaction()
    const signedTransaction = await keyService.safeSignTransaction({
      transaction: {
        signerAccountId: 'nat',
        signerPublicKey: DEFAULT_PUBLIC_KEY,
        nonce: accountKey.nonce + 1,
        blockHash,
        actions: [
          createAccount(),
          transfer({ amount: { near: '100' } }),
          addFullAccessKey({ publicKey: DEFAULT_PUBLIC_KEY }),
          deployContract({
            wasmBytes: await getFileBytes('../wasm/write-get-record.wasm'),
          }),
          functionCall({
            functionName: 'write_record',
            functionArgs: {
              record_id: 0,
              record: 'Hello',
            },
            gasLimit: { gas: 10 },
          }),
        ],
        receiverAccountId: 'abc.nat',
      },
    });

    if (!signedTransaction.ok) {
      log(signedTransaction);
      return;
    }

    const createContractResult = await client.sendSignedTransaction({
      signedTransaction: signedTransaction.value,
      // policies: { waitUntil: 'None' }
    });

    log(createContractResult);
  } catch (e) {
    /*

     */
    log(e);
  }

  // const res = await client.callContractReadFunction({
  //   contractAccountId: 'contract.nat',
  //   functionName: 'get_record',
  //   functionArgs: { record_id: 0 },
  // });
  //
  // console.log(res);
};

test(
  'Transaction Errors',
  {
    timeout: 30 * 1000,
  },
  async () => withSandbox(testFn),
);
