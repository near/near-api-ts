import { expect } from 'vitest';
import { transfer } from '../../../../../index';
import { signTransaction } from '../../../../../src/transaction/signTransaction/signTransaction';
import { getLastNonce } from '../../../../utils/getLastNonce';
import type { TestContext } from './replayProtection.test';

export const consecutiveNonce = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const natAccessKey = await client.getAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const nonce = getLastNonce(natAccessKey.accessKey) + 1;

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signer: {
        accountId: 'nat',
        publicKey: defaultKeyPair.publicKey,
        replayProtection: { scheme: 'NonceChannel', nonce },
      },
      recentBlockHash: natAccessKey.atMomentOf.blockHash,
      action: transfer({ amount: { yoctoNear: '1' } }),
      receiverAccountId: 'bob',
    },
  });

  const replayProtection = {
    scheme: 'NonceChannel',
    nonce,
    nonceProgression: 'Consecutive',
  };

  // The signed value carries the default the signature covers
  expect(signedTransaction.signedTransaction.transaction.signer.replayProtection).toStrictEqual(
    replayProtection,
  );

  const tx = await client.sendSignedTransaction({ signedTransaction });

  expect(tx.processingSteps.conversionStep.transactionSummary.signer).toStrictEqual({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
    replayProtection,
  });
};
