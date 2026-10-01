import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { expect } from 'vitest';
import { deleteAccount, near, stake } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../utils/assertTxResultExecutionErrKind';
import { getLastNonce } from '../../../../../utils/getLastNonce';
import type { TestContext } from './deleteAccount.test';

export const staking = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const natAccessKey = await client.getAccessKey({
    accountId: 'nat',
    publicKey: DEFAULT_PUBLIC_KEY,
  });

  // 1. Stake
  const signedStakeTx = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: DEFAULT_PUBLIC_KEY,
      nonce: getLastNonce(natAccessKey.accessKey) + 1,
      blockHash: natAccessKey.atMomentOf.blockHash,
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
      nonce: getLastNonce(natAccessKey.accessKey) + 2,
      blockHash: natAccessKey.atMomentOf.blockHash,
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
