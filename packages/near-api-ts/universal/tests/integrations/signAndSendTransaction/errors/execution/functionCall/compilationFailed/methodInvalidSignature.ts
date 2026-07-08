import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import {
  createAccount,
  deployContract,
  functionCall,
  near,
  transfer,
} from '../../../../../../../index';
import { safeSleep } from '../../../../../../../src/_common/utils/sleep';
import { signTransaction } from '../../../../../../../src/helpers/signTransaction';
import { assertTxResultExecutionErrKind } from '../../../../../../utils/assertTxResultExecutionErrKind';
import { log } from '../../../../../../utils/common';
import type { TestContext } from '../functionCall.test';

/**
 * wasmBase64 = compiled WAT: (module (func (export "add_record") (param i32)))
 *
 * `add_record` is exported with a param (i32), violating NEAR's required
 * `() -> ()` entrypoint signature -> Compilation.Failed
 */
export const methodInvalidSignature = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
    accountId: 'nat',
    publicKey: DEFAULT_PUBLIC_KEY,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: DEFAULT_PUBLIC_KEY,
      nonce: accountAccessKey.nonce + 1,
      blockHash,
      actions: [
        createAccount(),
        transfer({ amount: near('0.1') }),
        deployContract({
          wasmBase64: 'AGFzbQEAAAABBQFgAX8AAwIBAAcOAQphZGRfcmVjb3JkAAAKBAECAAsACgRuYW1lAgMBAAA=',
        }),
        functionCall({
          functionName: 'add_record',
          functionArgs: { record: 'hello' },
          gasLimit: { teraGas: '10' },
        }),
      ],
      receiverAccountId: 'test.nat',
    },
  });

  await client.safeSendSignedTransaction({ signedTransaction });
  await safeSleep(500);

  const txResult = await client.getTransactionResult({
    transactionHash: signedTransaction.transactionHash,
  });
  log(txResult);

  assertTxResultExecutionErrKind(txResult, 'Action.FunctionCall.Compilation.Failed');
};
