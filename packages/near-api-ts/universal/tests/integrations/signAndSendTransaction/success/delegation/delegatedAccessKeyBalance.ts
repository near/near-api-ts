import { expect } from 'vitest';
import {
  addAccessKey,
  executeDelegation,
  near,
  randomEd25519KeyPair,
  signDelegation,
  topUpAccessKeyBalance,
} from '../../../../../index';
import { signTransaction } from '../../../../../src/transaction/signTransaction/signTransaction';
import { getLastNonce } from '../../../../utils/getLastNonce';
import type { TestContext } from './delegation.test';

// Covers the delegation-only paths of the top-up: its slot (12) in the delegation borsh enum,
// decoding it back in `executeDelegation`, and the summary of the delegated action. A withdrawal
// cannot be delegated - nearcore refuses it inside a delegation since protocol 87.
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
      delegator: {
        accountId: delegatorAccountId,
        publicKey: defaultKeyPair.publicKey,
        replayProtection: { nonce: getLastNonce(delegatorAccessKey.accessKey) + 1 },
      },
      delegatedActions: [
        addAccessKey({
          publicKey: gasKeyPair.publicKey,
          permission: { kind: 'FullAccess' },
          gasPayment: { source: 'KeyBalance' },
          replayProtection: { channelCount: 1 },
        }),
        topUpAccessKeyBalance({ publicKey: gasKeyPair.publicKey, amount: near('1') }),
      ],
      receiverAccountId: delegatorAccountId,
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
      signer: {
        accountId: 'relay',
        publicKey: relayKeyPair.publicKey,
        replayProtection: {
          scheme: 'NonceChannel',
          nonce: getLastNonce(relayAccessKey.accessKey) + 1,
        },
      },
      recentBlockHash: relayAccessKey.atMomentOf.blockHash,
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
    ],
  });

  const gasAccessKey = await client.getAccessKey({
    accountId: delegatorAccountId,
    publicKey: gasKeyPair.publicKey,
  });

  expect(gasAccessKey.accessKey.gasPayment).toMatchObject({
    source: 'KeyBalance',
    balance: { near: '1' },
  });
};
