import { expect } from 'vitest';
import {
  addAccessKey,
  executeDelegation,
  randomEd25519KeyPair,
  signDelegation,
} from '../../../../../index';
import { signTransaction } from '../../../../../src/transaction/signTransaction/signTransaction';
import { getLastNonce } from '../../../../utils/getLastNonce';
import type { TestContext } from './delegation.test';

// Covers the delegation-only paths of a gas key: its borsh inside a delegation, decoding it back in
// `executeDelegation`, and the summary of the delegated action, where nearcore reports
// GasKeyFunctionCall as a tuple rather than the flat object the AddKey view has.
export const delegatedAddGasKey = (context: TestContext) => async () => {
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
        replayProtection: {
          scheme: 'NonceChannel',
          nonce: getLastNonce(delegatorAccessKey.accessKey) + 1,
        },
      },
      delegatedAction: addAccessKey({
        publicKey: gasKeyPair.publicKey,
        permission: { kind: 'FunctionCall', allowedContract: 'bob', allowedFunctions: ['ping'] },
        gasPayment: { source: 'KeyBalance' },
        replayProtection: { channelCount: 7 },
      }),
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
    minimalProcessingStage: 'ExecutedNearlyFinal',
  });

  expect(tx.processingSteps.conversionStep.transactionSummary.actionSummaries).toMatchObject([
    {
      actionType: 'ExecuteDelegation',
      delegation: {
        delegatedActionSummaries: [
          {
            actionType: 'AddAccessKey',
            publicKey: gasKeyPair.publicKey,
            permission: {
              kind: 'FunctionCall',
              allowedContract: 'bob',
              allowedFunctions: ['ping'],
            },
            gasPayment: { source: 'KeyBalance' },
            replayProtection: { scheme: 'NonceChannels', channelCount: 7 },
          },
        ],
      },
    },
  ]);

  const gasAccessKey = await client.getAccessKey({
    accountId: delegatorAccountId,
    publicKey: gasKeyPair.publicKey,
  });

  expect(gasAccessKey.accessKey).toMatchObject({
    permission: { kind: 'FunctionCall', allowedContract: 'bob', allowedFunctions: ['ping'] },
    gasPayment: { source: 'KeyBalance', balance: { yoctoNear: 0n } },
    replayProtection: { scheme: 'NonceChannels', channelCount: 7 },
  });
};
