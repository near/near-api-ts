import { expect } from 'vitest';
import {
  addAccessKey,
  randomEd25519KeyPair,
  signDelegation,
  transfer,
} from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../../utils/assertTxResultExecutionErrKind';
import { getLastNonce } from '../../../../../../utils/getLastNonce';
import type { TestContext } from '../executeDelegation.test';
import { sendDelegation } from './_common/sendDelegation';

// Attach a fresh key paid from its own balance - a key with nonce channels - to `alice`
const attachKeyWithNonceChannels = async (context: TestContext) => {
  const { client, defaultKeyPair } = context;

  const keyPairWithNonceChannels = randomEd25519KeyPair();

  const aliceAccessKey = await client.getAccessKey({
    accountId: 'alice',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signer: {
        accountId: 'alice',
        publicKey: defaultKeyPair.publicKey,
        replayProtection: {
          scheme: 'NonceChannel',
          nonce: getLastNonce(aliceAccessKey.accessKey) + 1,
        },
      },
      recentBlockHash: aliceAccessKey.atMomentOf.blockHash,
      action: addAccessKey({
        publicKey: keyPairWithNonceChannels.publicKey,
        permission: { kind: 'FullAccess' },
        gasPayment: { source: 'KeyBalance' },
        replayProtection: { channelCount: 2 },
      }),
      receiverAccountId: 'alice',
    },
  });

  await client.sendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  return keyPairWithNonceChannels;
};

export const nonceChannelsNotAllowed = (context: TestContext) => async () => {
  const { client } = context;

  // A delegation always takes the single nonce channel of its key, so a key with nonce channels
  // cannot sign one. Nearcore checks this before the nonce, so any nonce does.
  const keyPairWithNonceChannels = await attachKeyWithNonceChannels(context);

  const { atMomentOf } = await client.getAccessKey({
    accountId: 'alice',
    publicKey: keyPairWithNonceChannels.publicKey,
  });

  const signedDelegation = await signDelegation({
    delegation: {
      delegator: {
        accountId: 'alice',
        publicKey: keyPairWithNonceChannels.publicKey,
        replayProtection: { nonce: 1 },
      },
      delegatedAction: transfer({ amount: { near: '1' } }),
      receiverAccountId: 'bob',
      expiration: { blockHeight: atMomentOf.blockHeight + 100 },
    },
    signDataProvider: keyPairWithNonceChannels,
  });

  const { tx, transactionHash } = await sendDelegation(context, signedDelegation);

  assertNatErrKind(
    tx,
    'Client.SendSignedTransaction.Rpc.Action.ExecuteDelegation.Delegator.AccessKey.NonceChannels.NotAllowed',
  );

  const txResult = await client.getTransactionResult({ transactionHash });

  assertTxResultExecutionErrKind(
    txResult,
    'Action.ExecuteDelegation.Delegator.AccessKey.NonceChannels.NotAllowed',
  );
  expect(txResult.error.context).toBe(null);
};
