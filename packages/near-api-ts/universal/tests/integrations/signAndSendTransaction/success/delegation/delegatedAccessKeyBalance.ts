import { expect } from 'vitest';
import {
  addAccessKey,
  executeDelegation,
  near,
  randomEd25519KeyPair,
  signDelegation,
  topUpAccessKeyBalance,
  withdrawAccessKeyBalance,
} from '../../../../../index';
import { signTransaction } from '../../../../../src/transaction/signTransaction/signTransaction';
import { getLastNonce } from '../../../../utils/getLastNonce';
import type { TestContext } from './delegation.test';

// Covers the delegation-only paths of both actions: their slots (12 and 13) in the delegation borsh
// enum, decoding them back in `executeDelegation`, and the summaries of the delegated actions.
export const delegatedAccessKeyBalance = (context: TestContext) => async () => {
  const { client, defaultKeyPair, relayKeyPair } = context;
  const delegatorAccountId = 'alice';
  const gasKeyPair = randomEd25519KeyPair();

  const delegatorAccessKey = await client.getAccessKey({
    accountId: delegatorAccountId,
    publicKey: defaultKeyPair.publicKey,
  });

  const signedDelegation = await signDelegation({
    signDataProvider: defaultKeyPair,
    delegation: {
      delegatorAccountId,
      delegatorPublicKey: defaultKeyPair.publicKey,
      delegatedActions: [
        addAccessKey({
          publicKey: gasKeyPair.publicKey,
          permission: { kind: 'FullAccess' },
          gasPayment: { source: 'KeyBalance' },
          replayProtection: { channelCount: 1 },
        }),
        topUpAccessKeyBalance({ publicKey: gasKeyPair.publicKey, amount: near('1') }),
        withdrawAccessKeyBalance({ publicKey: gasKeyPair.publicKey, amount: near('0.25') }),
      ],
      receiverAccountId: delegatorAccountId,
      nonce: getLastNonce(delegatorAccessKey.accessKey) + 1,
      expiration: { blockHeight: delegatorAccessKey.atMomentOf.blockHeight + 100 },
    },
  });

  const relayAccessKey = await client.getAccessKey({
    accountId: 'relay',
    publicKey: relayKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: relayKeyPair,
    transaction: {
      signerAccountId: 'relay',
      signerPublicKey: relayKeyPair.publicKey,
      nonce: getLastNonce(relayAccessKey.accessKey) + 1,
      blockHash: relayAccessKey.atMomentOf.blockHash,
      action: executeDelegation(signedDelegation),
      receiverAccountId: delegatorAccountId,
    },
  });

  const tx = await client.sendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  expect(tx.processingSteps.conversionStep.transactionSummary.actionSummaries).toMatchObject([
    {
      actionType: 'ExecuteDelegation',
      delegation: {
        delegatedActionSummaries: [
          { actionType: 'AddAccessKey', publicKey: gasKeyPair.publicKey },
          {
            actionType: 'TopUpAccessKeyBalance',
            publicKey: gasKeyPair.publicKey,
            amount: { near: '1' },
          },
          {
            actionType: 'WithdrawAccessKeyBalance',
            publicKey: gasKeyPair.publicKey,
            amount: { near: '0.25' },
          },
        ],
      },
    },
  ]);

  // The delegated actions run in a receipt of their own, which reports them the same way
  expect(tx.processingSteps.executionSteps[1]).toMatchObject({
    result: { status: 'Success' },
    actionSummaries: [
      { actionType: 'AddAccessKey' },
      { actionType: 'TopUpAccessKeyBalance', amount: { near: '1' } },
      { actionType: 'WithdrawAccessKeyBalance', amount: { near: '0.25' } },
    ],
  });

  const { accessKey } = await client.getAccessKey({
    accountId: delegatorAccountId,
    publicKey: gasKeyPair.publicKey,
  });

  expect(accessKey.gasPayment).toMatchObject({
    source: 'KeyBalance',
    balance: { near: '0.75' },
  });
};
