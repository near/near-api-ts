import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { functionCall } from '../../../../../../index';
import { safeSleep } from '../../../../../../src/_common/utils/sleep';
import { signTransaction } from '../../../../../../src/helpers/signTransaction';
import { assertTxResultExecutionErrKind } from '../../../../../utils/assertTxResultExecutionErrKind';
import { log } from '../../../../../utils/common';
import type { TestContext } from './functionCall.test';

export const wasmNotFound = (context: TestContext) => async () => {
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
      action: functionCall({
        functionName: 'add_record',
        functionArgs: { record: 'hello' },
        gasLimit: { teraGas: '10' },
      }),

      receiverAccountId: 'nat',
    },
  });

  await client.safeSendSignedTransaction(signedTransaction);
  await safeSleep(500);

  const txResult = await client.getTransactionResult({
    transactionHash: signedTransaction.transactionHash,
  });
  log(txResult);
  assertTxResultExecutionErrKind(txResult, 'Action.FunctionCall.Wasm.NotFound');
};
