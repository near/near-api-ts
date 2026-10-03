import { expect } from 'vitest';
import { transfer } from '../../../../../index';
import { signTransaction } from '../../../../../src/transaction/signTransaction/signTransaction';
import { getLastNonce } from '../../../../utils/getLastNonce';
import type { TestContext } from './replayProtection.test';

// A consecutive nonce this far ahead is rejected - see `nonceGap` among the conversion errors.
export const increasingNonce = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const natAccessKey = await client.getAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const nonce = getLastNonce(natAccessKey.accessKey) + 10;

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signer: {
        accountId: 'nat',
        publicKey: defaultKeyPair.publicKey,
        replayProtection: { scheme: 'NonceChannel', nonce, nonceProgression: 'Increasing' },
      },
      recentBlockHash: natAccessKey.atMomentOf.blockHash,
      action: transfer({ amount: { yoctoNear: '1' } }),
      receiverAccountId: 'bob',
    },
  });

  const tx = await client.sendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  expect(
    tx.processingSteps.conversionStep.transactionSummary.signer.replayProtection,
  ).toStrictEqual({ scheme: 'NonceChannel', nonce, nonceProgression: 'Increasing' });

  const natAccessKeyAfter = await client.getAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  expect(getLastNonce(natAccessKeyAfter.accessKey)).toBe(nonce);
};
