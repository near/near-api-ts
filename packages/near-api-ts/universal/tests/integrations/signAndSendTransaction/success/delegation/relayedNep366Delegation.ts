import { sha256 } from '@noble/hashes/sha2.js';
import { serialize } from 'borsh';
import { expect } from 'vitest';
import { constants, executeDelegation } from '../../../../../index';
import {
  DelegationV1BorshSchema,
  SignedDelegationV1BorshSchema,
} from '../../../../../src/transaction/_common/delegationBorshSchema';
import { signTransaction } from '../../../../../src/transaction/signTransaction/signTransaction';
import type { NearcoreDelegationV1 } from '../../../../../types/_common/transaction/actions/executeDelegation/delegation';
import { getLastNonce } from '../../../../utils/getLastNonce';
import type { TestContext } from './delegation.test';

// `signDelegation` signs NEP-611 only, while wallets that predate it still hand out NEP-366
// delegations. Such a delegation is signed by hand here, the way those wallets do it, and the
// relayer must still be able to send it.
export const relayedNep366Delegation = (context: TestContext) => async () => {
  const { client, defaultKeyPair, relayKeyPair } = context;
  const delegatorAccountId = 'alice';

  const aliceAccessKey = await client.getAccessKey({
    accountId: delegatorAccountId,
    publicKey: defaultKeyPair.publicKey,
  });

  const nonce = getLastNonce(aliceAccessKey.accessKey) + 1;

  const nearcoreDelegation: NearcoreDelegationV1 = {
    tag: constants.Delegation.Nep366Tag,
    senderId: delegatorAccountId,
    receiverId: 'bob',
    actions: [{ transfer: { deposit: 1n } }],
    nonce: BigInt(nonce),
    maxBlockHeight: BigInt(aliceAccessKey.atMomentOf.blockHeight + 100),
    publicKey: { ed25519Key: { data: defaultKeyPair.publicKeyU8 } },
  };

  const { signatureU8 } = await defaultKeyPair.signData({
    dataU8: sha256(serialize(DelegationV1BorshSchema, nearcoreDelegation)),
  });

  const signedDelegationBorsh64 = serialize(SignedDelegationV1BorshSchema, {
    delegation: nearcoreDelegation,
    signature: { ed25519Signature: { data: signatureU8 } },
  }).toBase64();

  const executeDelegationAction = executeDelegation({ signedDelegationBorsh64 });

  const delegation = {
    tag: constants.Delegation.Nep366Tag,
    delegator: {
      accountId: delegatorAccountId,
      publicKey: defaultKeyPair.publicKey,
      replayProtection: { scheme: 'NonceChannel', nonce },
    },
    receiverAccountId: 'bob',
  };

  expect(executeDelegationAction.signedDelegation.delegation).toMatchObject(delegation);

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
      action: executeDelegationAction,
      receiverAccountId: delegatorAccountId,
    },
  });

  const tx = await client.sendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  expect(tx.processingSteps.conversionStep.transactionSummary.actionSummaries).toMatchObject([
    { actionType: 'ExecuteDelegation', delegation },
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
