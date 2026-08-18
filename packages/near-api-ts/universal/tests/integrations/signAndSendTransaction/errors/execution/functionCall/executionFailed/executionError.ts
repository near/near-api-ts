import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { expect } from 'vitest';
import {
  createAccount,
  deployContract,
  functionCall,
  near,
  transfer,
} from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/transaction/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../../utils/assertTxResultExecutionErrKind';
import { getFileBytes } from '../../../../../../utils/common';
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

  const tx = await client.safeSendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Action.FunctionCall.Execution.Failed');

  const txResult = await client.getTransactionResult({
    transactionHash: signedTransaction.transactionHash,
  });

  assertTxResultExecutionErrKind(txResult, 'Action.FunctionCall.Execution.Failed');
  expect(txResult.error.context.cause).toBe('Exceeded the prepaid gas.');
};
