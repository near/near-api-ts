import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { expect } from 'vitest';
import { deleteKey, randomEd25519KeyPair } from '../../../../../../index';
import { safeSleep } from '../../../../../../src/_common/utils/sleep';
import { signTransaction } from '../../../../../../src/helpers/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../utils/assertTxResultExecutionErrKind';
import type { TestContext } from './deleteKey.test';

export const notFound = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const missingPublicKey = randomEd25519KeyPair().publicKey;

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
      action: deleteKey({ publicKey: missingPublicKey }),
      receiverAccountId: 'nat',
    },
  });

  const tx = await client.safeSendSignedTransaction(signedTransaction);

  // TODO rework after rework SendSignedTransaction
  assertNatErrKind(tx, 'Client.SendSignedTransaction.Internal');
  await safeSleep(500);

  const txResult = await client.getTransactionResult({
    transactionHash: signedTransaction.transactionHash,
  });

  assertTxResultExecutionErrKind(txResult, 'Action.DeleteKey.NotFound');
  expect(txResult.result.error.context).toStrictEqual({
    accountId: 'nat',
    publicKey: missingPublicKey,
  });
};
