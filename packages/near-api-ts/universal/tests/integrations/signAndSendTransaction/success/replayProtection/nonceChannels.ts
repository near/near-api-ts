import { expect } from 'vitest';
import {
  addAccessKey,
  near,
  randomEd25519KeyPair,
  topUpAccessKeyBalance,
  transfer,
} from '../../../../../index';
import { signTransaction } from '../../../../../src/transaction/signTransaction/signTransaction';
import { getLastNonce } from '../../../../utils/getLastNonce';
import type { TestContext } from './replayProtection.test';

const CHANNEL_COUNT = 3;

export const nonceChannels = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;
  const gasKeyPair = randomEd25519KeyPair();

  const natAccessKey = await client.getAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  // A key with nonce channels pays for gas from its own balance, so it is funded right away
  const addKeyTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signer: {
        accountId: 'nat',
        publicKey: defaultKeyPair.publicKey,
        replayProtection: {
          scheme: 'NonceChannel',
          nonce: getLastNonce(natAccessKey.accessKey) + 1,
        },
      },
      recentBlockHash: natAccessKey.atMomentOf.blockHash,
      actions: [
        addAccessKey({
          publicKey: gasKeyPair.publicKey,
          permission: { kind: 'FullAccess' },
          gasPayment: { source: 'KeyBalance' },
          replayProtection: { channelCount: CHANNEL_COUNT },
        }),
        topUpAccessKeyBalance({ publicKey: gasKeyPair.publicKey, amount: near('1') }),
      ],
      receiverAccountId: 'nat',
    },
  });

  await client.sendSignedTransaction({
    signedTransaction: addKeyTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  const channelsBefore = await client.getAccessKeyNonceChannels({
    accountId: 'nat',
    publicKey: gasKeyPair.publicKey,
  });

  // One transaction per channel, all sent at once: every channel keeps a nonce of its own,
  // so none of them waits for another to land.
  const transactions = await Promise.all(
    channelsBefore.nonceChannels.map(async ({ channelId, lastNonce }) => {
      const signedTransaction = await signTransaction({
        signDataProvider: gasKeyPair,
        transaction: {
          signer: {
            accountId: 'nat',
            publicKey: gasKeyPair.publicKey,
            replayProtection: {
              scheme: 'NonceChannels',
              nonceChannelId: channelId,
              nonce: lastNonce + 1,
            },
          },
          recentBlockHash: channelsBefore.atMomentOf.blockHash,
          action: transfer({ amount: { yoctoNear: '1' } }),
          receiverAccountId: 'bob',
        },
      });

      return client.sendSignedTransaction({
        signedTransaction,
        minimalProcessingStage: 'CompletedFinal',
      });
    }),
  );

  transactions.forEach((tx, index) => {
    const { channelId, lastNonce } = channelsBefore.nonceChannels[index];

    expect(tx.processingSteps.conversionStep.transactionSummary.signer).toStrictEqual({
      accountId: 'nat',
      publicKey: gasKeyPair.publicKey,
      replayProtection: {
        scheme: 'NonceChannels',
        nonceChannelId: channelId,
        nonce: lastNonce + 1,
        nonceProgression: 'Consecutive',
      },
    });
  });

  const channelsAfter = await client.getAccessKeyNonceChannels({
    accountId: 'nat',
    publicKey: gasKeyPair.publicKey,
  });

  expect(channelsAfter.nonceChannels).toStrictEqual(
    channelsBefore.nonceChannels.map(({ channelId, lastNonce }) => ({
      channelId,
      lastNonce: lastNonce + 1,
    })),
  );
};
