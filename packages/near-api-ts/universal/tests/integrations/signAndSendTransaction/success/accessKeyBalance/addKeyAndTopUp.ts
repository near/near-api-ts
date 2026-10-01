import { expect } from 'vitest';
import {
  addAccessKey,
  near,
  randomEd25519KeyPair,
  topUpAccessKeyBalance,
} from '../../../../../index';
import { signTransaction } from '../../../../../src/transaction/signTransaction/signTransaction';
import { getLastNonce } from '../../../../utils/getLastNonce';
import type { TestContext } from './accessKeyBalance.test';

export const addKeyAndTopUp = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;
  const gasKeyPair = randomEd25519KeyPair();

  const natAccessKey = await client.getAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: defaultKeyPair.publicKey,
      nonce: getLastNonce(natAccessKey.accessKey) + 1,
      blockHash: natAccessKey.atMomentOf.blockHash,
      actions: [
        addAccessKey({
          publicKey: gasKeyPair.publicKey,
          permission: { kind: 'FullAccess' },
          gasPayment: { source: 'KeyBalance' },
          replayProtection: { channelCount: 2 },
        }),
        topUpAccessKeyBalance({ publicKey: gasKeyPair.publicKey, amount: near('2') }),
      ],
      receiverAccountId: 'nat',
    },
  });

  const tx = await client.sendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  expect(tx.processingSteps.conversionStep.transactionSummary.actionSummaries[1]).toStrictEqual({
    actionType: 'TopUpAccessKeyBalance',
    publicKey: gasKeyPair.publicKey,
    amount: expect.objectContaining({ near: '2' }),
  });

  const gasAccessKey = await client.getAccessKey({
    accountId: 'nat',
    publicKey: gasKeyPair.publicKey,
  });

  expect(gasAccessKey.accessKey.gasPayment).toMatchObject({
    source: 'KeyBalance',
    balance: { near: '2' },
  });
};
