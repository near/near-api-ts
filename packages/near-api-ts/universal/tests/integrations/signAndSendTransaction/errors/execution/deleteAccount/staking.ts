import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { expect } from 'vitest';
import { deleteAccount, near, stake } from '../../../../../../index';
import { safeSleep } from '../../../../../../src/_common/utils/sleep';
import { signTransaction } from '../../../../../../src/helpers/signTransaction';
import { assertTxResultExecutionErrKind } from '../../../../../utils/assertTxResultExecutionErrKind';
import type { TestContext } from './deleteAccount.test';

export const staking = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
    accountId: 'nat',
    publicKey: DEFAULT_PUBLIC_KEY,
  });

  // 1. Stake
  const signedStakeTx = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: DEFAULT_PUBLIC_KEY,
      nonce: accountAccessKey.nonce + 1,
      blockHash,
      action: stake({ amount: near('1000'), validatorPublicKey: DEFAULT_PUBLIC_KEY }),
      receiverAccountId: 'nat',
    },
  });

  await client.safeSendSignedTransaction(signedStakeTx);
  await safeSleep(500);

  // 2. Try to delete an account
  const signedDeleteAccountTx = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: DEFAULT_PUBLIC_KEY,
      nonce: accountAccessKey.nonce + 2,
      blockHash,
      action: deleteAccount({ beneficiaryAccountId: 'alice' }),
      receiverAccountId: 'nat',
    },
  });

  await client.safeSendSignedTransaction(signedDeleteAccountTx);
  await safeSleep(500);

  const txResult = await client.getTransactionResult({
    transactionHash: signedDeleteAccountTx.transactionHash,
  });

  assertTxResultExecutionErrKind(txResult, 'Action.DeleteAccount.Staking');
  expect(txResult.result.error.context.accountId).toBe('nat');
};
