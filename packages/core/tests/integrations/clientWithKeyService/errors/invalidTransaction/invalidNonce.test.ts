import { beforeAll, describe, it, vi } from 'vitest';
import {
  createMemoryKeyService,
  transfer,
  type Client,
  type MemoryKeyService,
} from '../../../../../src';
import { createDefaultClient } from '../../../../utils/common';
import { startSandbox } from '../../../../utils/sandbox/startSandbox';
import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { testKeys } from '../../../../utils/testKeys';
import { assertNatErrKind } from '../../../../utils/assertNatErrKind';

vi.setConfig({ testTimeout: 60000 });

describe('Execute transaction', () => {
  let client: Client;
  let keyService: MemoryKeyService;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = await createDefaultClient(sandbox);
    keyService = await createMemoryKeyService({
      keySources: [
        { privateKey: DEFAULT_PRIVATE_KEY },
        { privateKey: testKeys.fc.forContract.privateKey },
      ],
    });
    return () => sandbox.stop();
  });

  it('Invalid Nonce', async () => {
    const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
      accountId: 'nat',
      publicKey: DEFAULT_PUBLIC_KEY,
    });

    const signedTransaction = await keyService.signTransaction({
      transaction: {
        signerAccountId: 'nat',
        signerPublicKey: DEFAULT_PUBLIC_KEY,
        nonce: accountAccessKey.nonce + 0,
        blockHash,
        action: transfer({ amount: { near: '100' } }),
        receiverAccountId: 'bob',
      },
    });

    const res = await client.safeSendSignedTransaction({
      signedTransaction,
    });
    assertNatErrKind(
      res,
      'Client.SendSignedTransaction.Rpc.Transaction.Nonce.Invalid',
    );
  });
});

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

// const testFn = async (args: { rpcUrl: string }) => {
//   try {
//
//     // signerPublicKey: testKeys.fc.forContract.publicKey,
//
//     // const x = await keyService.signTransaction()
//
//
//     if (!signedTransaction.ok) {
//       log(signedTransaction);
//       return;
//     }
//
//     console.log(signedTransaction);
//
//     // const createContractResult = await client.sendSignedTransaction({
//     //   signedTransaction: {
//     //     ...signedTransaction.value,
//     //     // signature: 'ed25519:4ALChq1Czyemn5UGZLn7cW4zae45ycTwigru897bKYLGEt36p88vaY3Yht1cLNLtrRrrKwTqotKVeLWVFmp388GM'// M
//     //   },
//     // });
//     //
//     // log(createContractResult);
//     //
//     // const balance = await client.getAccountInfo({ accountId: 'nat' });
//     // log(balance);
//   } catch (e) {
//     /*
//
//      */
//     log(e);
//   }

// const res = await client.callContractReadFunction({
//   contractAccountId: 'contract.nat',
//   functionName: 'get_record',
//   functionArgs: { record_id: 0 },
// });
//
// console.log(res);

// test(
//   'Transaction Errors',
//   {
//     timeout: 30 * 1000,
//   },
//   async () => withSandbox(testFn),
// );
