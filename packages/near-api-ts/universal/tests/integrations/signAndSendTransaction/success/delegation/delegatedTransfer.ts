import { expect } from 'vitest';
import { constants, executeDelegation, signDelegation, transfer } from '../../../../../index';
import { signTransaction } from '../../../../../src/transaction/signTransaction/signTransaction';
import { getLastNonce } from '../../../../utils/getLastNonce';
import type { TestContext } from './delegation.test';

// A delegation is signed in the NEP-366 format, on the single nonce channel of the delegator's key.
// The action summary reports just its nonce, the way the delegation takes it - no scheme, unlike a
// NEP-611 delegation from before protocol 87, which could use a nonce channel of a key paid from
// its own balance.
export const delegatedTransfer = (context: TestContext) => async () => {
  const { client, defaultKeyPair, relayKeyPair } = context;
  const delegatorAccountId = 'alice';

  const aliceAccessKey = await client.getAccessKey({
    accountId: delegatorAccountId,
    publicKey: defaultKeyPair.publicKey,
  });

  const nonce = getLastNonce(aliceAccessKey.accessKey) + 1;

  const signedDelegation = await signDelegation({
    signDataProvider: defaultKeyPair,
    delegation: {
      delegator: {
        accountId: delegatorAccountId,
        publicKey: defaultKeyPair.publicKey,
        replayProtection: { nonce },
      },
      delegatedAction: transfer({ amount: { yoctoNear: '1' } }),
      receiverAccountId: 'bob',
      expiration: { blockHeight: aliceAccessKey.atMomentOf.blockHeight + 100 },
    },
  });

  expect(signedDelegation.signedDelegation.delegation).toMatchObject({
    tag: constants.Delegation.Nep366Tag,
    delegator: { replayProtection: { nonce } },
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

  expect(tx.processingSteps.conversionStep.transactionSummary.actionSummaries).toStrictEqual([
    {
      actionType: 'ExecuteDelegation',
      delegation: {
        tag: constants.Delegation.Nep366Tag,
        delegator: {
          accountId: delegatorAccountId,
          publicKey: defaultKeyPair.publicKey,
          replayProtection: { nonce },
        },
        delegatedActionSummaries: [
          { actionType: 'Transfer', amount: expect.objectContaining({ yoctoNear: 1n }) },
        ],
        receiverAccountId: 'bob',
        expiration: { blockHeight: aliceAccessKey.atMomentOf.blockHeight + 100 },
      },
      signature: signedDelegation.signedDelegation.signature,
    },
  ]);

  expect(tx.processingSteps.executionSteps[1]).toMatchObject({
    result: { status: 'Success' },
    actionSummaries: [{ actionType: 'Transfer' }],
  });

  const aliceAccessKeyAfter = await client.getAccessKey({
    accountId: delegatorAccountId,
    publicKey: defaultKeyPair.publicKey,
  });

  expect(getLastNonce(aliceAccessKeyAfter.accessKey)).toBe(nonce);
};
