import { test } from 'vitest';
import {
  createClient,
  createMemoryKeyService,
  transfer,
  addFullAccessKey,
  createAccount,
  deployContract,
  functionCall,
  deleteAccount,
  yoctoNear,
} from '../../../src';
import { getFileBytes, log } from '../utils/common';
import { withSandbox } from '../utils/sandbox/startSandbox';
import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { testKeys } from '../utils/testKeys';

const testFn = async (args: { rpcUrl: string }) => {
  try {
    const client = await createClient({
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
        // signerPublicKey: testKeys.fc.forContract.publicKey,
        nonce: accountKey.nonce + 1,
        blockHash,
        // blockHash: '27ovJAPbgw1FyHWDmH62s7PinEDW5eif1ApG6dp4W2Wr',
        actions: [
          createAccount(),
          // transfer({ amount: { yoctoNear: '10000000000000000000000000000' } }),
          transfer({
            amount: yoctoNear('10000000000000000000000000000')
              .sub(yoctoNear('834989537500000000000'))
              //.add({ yoctoNear: '1' }),
          }),
          // deleteAccount({ beneficiaryAccountId: 'nat'}),
          addFullAccessKey({ publicKey: DEFAULT_PUBLIC_KEY }),
          // deployContract({
          //   wasmBytes: await getFileBytes('../wasm/write-get-record.wasm'),
          // }),
          // functionCall({
          //   functionName: 'write_record',
          //   functionArgs: {
          //     record_id: 0,
          //     record: 'Hello',
          //   },
          //   gasLimit: { teraGas: '100' },
          // }),
        ],
        receiverAccountId: '123.nat',
      },
    });

    if (!signedTransaction.ok) {
      log(signedTransaction);
      return;
    }

    console.log(signedTransaction);

    // const createContractResult = await client.sendSignedTransaction({
    //   signedTransaction: {
    //     ...signedTransaction.value,
    //     // signature: 'ed25519:4ALChq1Czyemn5UGZLn7cW4zae45ycTwigru897bKYLGEt36p88vaY3Yht1cLNLtrRrrKwTqotKVeLWVFmp388GM'// M
    //   },
    // });
    //
    // log(createContractResult);
    //
    // const balance = await client.getAccountInfo({ accountId: 'nat' });
    // log(balance);
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
