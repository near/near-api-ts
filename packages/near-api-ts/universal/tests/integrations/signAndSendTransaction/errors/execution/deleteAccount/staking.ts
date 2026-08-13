import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { expect } from 'vitest';
import { deleteAccount, near, stake } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/signServices/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
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

  await client.safeSendSignedTransaction({
    signedTransaction: signedStakeTx,
    minimalProcessingStage: 'CompletedFinal',
  });

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

  const tx = await client.safeSendSignedTransaction({
    signedTransaction: signedDeleteAccountTx,
    minimalProcessingStage: 'CompletedFinal',
  });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Action.DeleteAccount.Staking');

  const txResult = await client.getTransactionResult({
    transactionHash: signedDeleteAccountTx.transactionHash,
  });

  assertTxResultExecutionErrKind(txResult, 'Action.DeleteAccount.Staking');
  expect(txResult.error.context.accountId).toBe('nat');
};
