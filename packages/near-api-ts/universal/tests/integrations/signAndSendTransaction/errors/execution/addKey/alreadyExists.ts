import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { expect } from 'vitest';
import { addFunctionCallKey } from '../../../../../../index';
import { safeSleep } from '../../../../../../src/_common/utils/sleep';
import { signTransaction } from '../../../../../../src/helpers/signTransaction';
import { assertTxResultExecutionErrKind } from '../../../../../utils/assertTxResultExecutionErrKind';
import type { TestContext } from './addKey.test';

export const alreadyExists = (context: TestContext) => async () => {
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
      action: addFunctionCallKey({
        publicKey: DEFAULT_PUBLIC_KEY,
        contractAccountId: 'alice',
        gasBudget: { near: '2.25' },
        allowedFunctions: 'AllNonPayable',
      }),
      receiverAccountId: 'nat',
    },
  });

  await client.safeSendSignedTransaction({ signedTransaction });
  await safeSleep(500);

  const txResult = await client.getTransactionResult({
    transactionHash: signedTransaction.transactionHash,
  });

  assertTxResultExecutionErrKind(txResult, 'Action.AddKey.AlreadyExists');
  expect(txResult.result.error.context).toStrictEqual({
    accountId: 'nat',
    publicKey: DEFAULT_PUBLIC_KEY,
  });
};
