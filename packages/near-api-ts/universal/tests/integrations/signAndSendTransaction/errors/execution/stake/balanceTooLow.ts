import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { expect } from 'vitest';
import { near, randomEd25519KeyPair, stake } from '../../../../../../index';
import { safeSleep } from '../../../../../../src/_common/utils/sleep';
import { signTransaction } from '../../../../../../src/helpers/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../utils/assertTxResultExecutionErrKind';
import type { TestContext } from './stake.test';

export const balanceTooLow = (context: TestContext) => async () => {
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
      action: stake({
        amount: near('100000000'),
        validatorPublicKey: randomEd25519KeyPair().publicKey,
      }),
      receiverAccountId: 'nat',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  // TODO rework after rework SendSignedTransaction
  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Transaction.Action.Stake.Balance.TooLow');
  await safeSleep(500);

  const txResult = await client.getTransactionResult({
    transactionHash: signedTransaction.transactionHash,
  });

  assertTxResultExecutionErrKind(txResult, 'Action.Stake.NotEnoughBalance');
  expect(txResult.result.error.context).toMatchObject({
    validatorAccountId: 'nat',
    proposedStake: near('100000000'),
  });
};
