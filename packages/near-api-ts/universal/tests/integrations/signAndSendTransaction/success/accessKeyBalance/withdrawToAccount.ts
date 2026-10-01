import { expect } from 'vitest';
import {
  addAccessKey,
  near,
  randomEd25519KeyPair,
  topUpAccessKeyBalance,
  withdrawAccessKeyBalance,
} from '../../../../../index';
import { signTransaction } from '../../../../../src/transaction/signTransaction/signTransaction';
import { getLastNonce } from '../../../../utils/getLastNonce';
import type { TestContext } from './accessKeyBalance.test';

export const withdrawToAccount = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;
  const gasKeyPair = randomEd25519KeyPair();

  // `nat` adds a key paid from its own balance and funds it with 3 NEAR
  const natAccessKeyBeforeFunding = await client.getAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const fundingTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: defaultKeyPair.publicKey,
      nonce: getLastNonce(natAccessKeyBeforeFunding.accessKey) + 1,
      blockHash: natAccessKeyBeforeFunding.atMomentOf.blockHash,
      actions: [
        addAccessKey({
          publicKey: gasKeyPair.publicKey,
          permission: { kind: 'FullAccess' },
          gasPayment: { source: 'KeyBalance' },
          replayProtection: { channelCount: 2 },
        }),
        topUpAccessKeyBalance({ publicKey: gasKeyPair.publicKey, amount: near('3') }),
      ],
      receiverAccountId: 'nat',
    },
  });

  await client.sendSignedTransaction({
    signedTransaction: fundingTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  const before = await client.getAccountInfo({ accountId: 'nat' });

  const natAccessKeyBeforeWithdrawal = await client.getAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const withdrawalTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: defaultKeyPair.publicKey,
      nonce: getLastNonce(natAccessKeyBeforeWithdrawal.accessKey) + 1,
      blockHash: natAccessKeyBeforeWithdrawal.atMomentOf.blockHash,
      action: withdrawAccessKeyBalance({ publicKey: gasKeyPair.publicKey, amount: near('2.5') }),
      receiverAccountId: 'nat',
    },
  });

  const tx = await client.sendSignedTransaction({
    signedTransaction: withdrawalTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  expect(tx.processingSteps.conversionStep.transactionSummary.actionSummaries).toStrictEqual([
    {
      actionType: 'WithdrawAccessKeyBalance',
      publicKey: gasKeyPair.publicKey,
      amount: expect.objectContaining({ near: '2.5' }),
    },
  ]);

  const gasAccessKey = await client.getAccessKey({
    accountId: 'nat',
    publicKey: gasKeyPair.publicKey,
  });

  expect(gasAccessKey.accessKey.gasPayment).toMatchObject({
    source: 'KeyBalance',
    balance: { near: '0.5' },
  });

  // The account gets the whole amount and pays the transaction fee out of it
  const after = await client.getAccountInfo({ accountId: 'nat' });
  const received = after.balance.total.sub(before.balance.total);

  expect(received.gt(near('2.49'))).toBe(true);
  expect(received.lt(near('2.5'))).toBe(true);
};
