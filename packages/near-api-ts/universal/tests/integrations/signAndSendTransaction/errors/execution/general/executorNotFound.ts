import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { expect } from 'vitest';
import { transfer } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/helpers/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../utils/assertTxResultExecutionErrKind';
import type { TestContext } from './general.test';

export const executorNotFound = (context: TestContext) => async () => {
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
      action: transfer({ amount: { near: '1' } }),
      receiverAccountId: 'not-exist',
    },
  });

  const tx = await client.safeSendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Executor.NotFound');

  const txResult = await client.getTransactionResult({
    transactionHash: signedTransaction.transactionHash,
  });

  assertTxResultExecutionErrKind(txResult, 'Executor.NotFound');
  expect(txResult.error.context.executorAccountId).toBe('not-exist');
};
