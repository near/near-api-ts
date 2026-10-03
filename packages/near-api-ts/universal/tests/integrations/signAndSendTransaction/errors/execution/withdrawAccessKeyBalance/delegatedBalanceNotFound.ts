import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { expect } from 'vitest';
import {
  executeDelegation,
  near,
  randomEd25519KeyPair,
  signDelegation,
  withdrawAccessKeyBalance,
} from '../../../../../../index';
import { signTransaction } from '../../../../../../src/transaction/signTransaction/signTransaction';
import { getLastNonce } from '../../../../../utils/getLastNonce';
import type { TestContext } from './withdrawAccessKeyBalance.test';

// The delegated actions fail in a receipt of their own, after the delegation itself has succeeded -
// so nearcore reports the transaction as a success, and only that receipt's step carries the error.
export const delegatedBalanceNotFound = (context: TestContext) => async () => {
  const { client, defaultKeyPair, relayKeyPair } = context;
  const delegatorAccountId = 'alice';
  const missingKeyPair = randomEd25519KeyPair();

  const delegatorAccessKey = await client.getAccessKey({
    accountId: delegatorAccountId,
    publicKey: DEFAULT_PUBLIC_KEY,
  });

  const signedDelegation = await signDelegation({
    signDataProvider: defaultKeyPair,
    delegation: {
      delegator: {
        accountId: delegatorAccountId,
        publicKey: DEFAULT_PUBLIC_KEY,
        replayProtection: {
          scheme: 'NonceChannel',
          nonce: getLastNonce(delegatorAccessKey.accessKey) + 1,
        },
      },
      delegatedAction: withdrawAccessKeyBalance({
        publicKey: missingKeyPair.publicKey,
        amount: near('1'),
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
    minimalProcessingStage: 'CompletedFinal',
  });

  expect(tx.processingSteps.executionSteps[1]).toMatchObject({
    actionSummaries: [{ actionType: 'WithdrawAccessKeyBalance' }],
    result: {
      status: 'Failure',
      error: {
        kind: 'Action.WithdrawAccessKeyBalance.Balance.NotFound',
        context: { accountId: delegatorAccountId, publicKey: missingKeyPair.publicKey },
      },
    },
  });
};
