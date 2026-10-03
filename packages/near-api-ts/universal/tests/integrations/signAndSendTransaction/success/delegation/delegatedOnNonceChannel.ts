import { expect } from 'vitest';
import {
  addAccessKey,
  constants,
  executeDelegation,
  randomEd25519KeyPair,
  signDelegation,
  transfer,
} from '../../../../../index';
import { signTransaction } from '../../../../../src/transaction/signTransaction/signTransaction';
import { getLastNonce } from '../../../../utils/getLastNonce';
import type { TestContext } from './delegation.test';

// A delegation signed on one nonce channel of a key paid from its own balance - something only
// the NEP-611 format can express. The relayer pays for it, so the key needs no balance.
export const delegatedOnNonceChannel = (context: TestContext) => async () => {
  const { client, defaultKeyPair, relayKeyPair } = context;
  const delegatorAccountId = 'alice';
  const gasKeyPair = randomEd25519KeyPair();
  const nonceChannelId = 1;

  const aliceAccessKey = await client.getAccessKey({
    accountId: delegatorAccountId,
    publicKey: defaultKeyPair.publicKey,
  });

  const addKeyTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signer: {
        accountId: delegatorAccountId,
        publicKey: defaultKeyPair.publicKey,
        replayProtection: {
          scheme: 'NonceChannel',
          nonce: getLastNonce(aliceAccessKey.accessKey) + 1,
        },
      },
      recentBlockHash: aliceAccessKey.atMomentOf.blockHash,
      action: addAccessKey({
        publicKey: gasKeyPair.publicKey,
        permission: { kind: 'FullAccess' },
        gasPayment: { source: 'KeyBalance' },
        replayProtection: { channelCount: 2 },
      }),
      receiverAccountId: delegatorAccountId,
    },
  });

  await client.sendSignedTransaction({
    signedTransaction: addKeyTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  const channelsBefore = await client.getAccessKeyNonceChannels({
    accountId: delegatorAccountId,
    publicKey: gasKeyPair.publicKey,
  });

  const nonce = channelsBefore.nonceChannels[nonceChannelId].lastNonce + 1;

  const signedDelegation = await signDelegation({
    signDataProvider: gasKeyPair,
    delegation: {
      delegator: {
        accountId: delegatorAccountId,
        publicKey: gasKeyPair.publicKey,
        replayProtection: { scheme: 'NonceChannels', nonceChannelId, nonce },
      },
      delegatedAction: transfer({ amount: { yoctoNear: '1' } }),
      receiverAccountId: 'bob',
      expiration: { blockHeight: channelsBefore.atMomentOf.blockHeight + 100 },
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
        tag: constants.Delegation.Nep611Tag,
        delegator: {
          accountId: delegatorAccountId,
          publicKey: gasKeyPair.publicKey,
          replayProtection: { scheme: 'NonceChannels', nonceChannelId, nonce },
        },
        receiverAccountId: 'bob',
      },
    },
  ]);

  // A delegation that fails does not fail the transaction - only its own receipt shows it
  expect(tx.processingSteps.executionSteps[1]).toMatchObject({
    result: { status: 'Success' },
    actionSummaries: [{ actionType: 'Transfer' }],
  });

  const channelsAfter = await client.getAccessKeyNonceChannels({
    accountId: delegatorAccountId,
    publicKey: gasKeyPair.publicKey,
  });

  expect(channelsAfter.nonceChannels).toStrictEqual([
    channelsBefore.nonceChannels[0],
    { channelId: nonceChannelId, lastNonce: nonce },
  ]);
};
