import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { expect } from 'vitest';
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
import { getFileBytes, log } from '../../../../../../utils/common';
import type { TestContext } from '../functionCall.test';

export const executionError = (context: TestContext) => async () => {
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
        transfer({ amount: near('10') }),
        deployContract({ wasmBytes: await getFileBytes('./wasm/write-get-record.wasm') }),
        functionCall({
          functionName: 'add_record',
          functionArgs: { record: 'hello' },
          gasLimit: { teraGas: '0.01' },
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

  assertTxResultExecutionErrKind(txResult, 'Action.FunctionCall.Execution.Failed');
  expect(txResult.result.error.context.cause).toBe('Exceeded the prepaid gas.');
};
