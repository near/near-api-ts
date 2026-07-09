import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import {
  addFullAccessKey,
  createAccount,
  deployContract,
  functionCall,
  transfer,
} from '../../../../../../index';
import { safeSleep } from '../../../../../../src/_common/utils/sleep';
import { signTransaction } from '../../../../../../src/helpers/signTransaction';
import { assertTxResultExecutionErrKind } from '../../../../../utils/assertTxResultExecutionErrKind';
import { getFileBytes, log } from '../../../../../utils/common';
import type { TestContext } from './functionCall.test';

export const functionNotFound = (context: TestContext) => async () => {
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
        transfer({ amount: { near: '10' } }),
        addFullAccessKey(defaultKeyPair),
        deployContract({ wasmBytes: await getFileBytes('./wasm/write-get-record.wasm') }),
        functionCall({
          functionName: 'not_exist',
          gasLimit: { teraGas: '10' },
        }),
      ],
      receiverAccountId: 'contract.nat',
    },
  });

  await client.safeSendSignedTransaction(signedTransaction);
  await safeSleep(500);

  const txResult = await client.getTransactionResult({
    transactionHash: signedTransaction.transactionHash,
  });
  log(txResult);
  assertTxResultExecutionErrKind(txResult, 'Action.FunctionCall.Function.NotFound');
};
