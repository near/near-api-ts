import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { expect } from 'vitest';
import { createAccount } from '../../../../../../index';
import { safeSleep } from '../../../../../../src/_common/utils/sleep';
import { signTransaction } from '../../../../../../src/helpers/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../utils/assertTxResultExecutionErrKind';
import type { TestContext } from './createAccount.test';

export const topLevelNamespace = (context: TestContext) => async () => {
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
      action: createAccount(),
      receiverAccountId: 'top-level-account',
    },
  });

  const tx = await client.safeSendSignedTransaction(signedTransaction);

  // TODO rework after rework SendSignedTransaction
  assertNatErrKind(tx, 'Client.SendSignedTransaction.Internal');
  await safeSleep(500);

  const txResult = await client.getTransactionResult({
    transactionHash: signedTransaction.transactionHash,
  });
  assertTxResultExecutionErrKind(txResult, 'Action.CreateAccount.TopLevelNamespace');

  expect(txResult.result.error.context).toStrictEqual({
    newAccountId: 'top-level-account',
    creatorAccountId: 'nat',
    registrarAccountId: 'registrar',
  });
};
