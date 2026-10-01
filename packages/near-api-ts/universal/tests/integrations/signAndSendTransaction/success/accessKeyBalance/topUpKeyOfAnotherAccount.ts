import { expect } from 'vitest';
import { addAccessKey, randomEd25519KeyPair, topUpAccessKeyBalance } from '../../../../../index';
import { signTransaction } from '../../../../../src/transaction/signTransaction/signTransaction';
import { getLastNonce } from '../../../../utils/getLastNonce';
import type { TestContext } from './accessKeyBalance.test';

// `nat` adds a key paid from its own balance, which starts empty, and `alice` tops it up
export const topUpKeyOfAnotherAccount = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;
  const gasKeyPair = randomEd25519KeyPair();

  const natAccessKey = await client.getAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const addKeyTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: defaultKeyPair.publicKey,
      nonce: getLastNonce(natAccessKey.accessKey) + 1,
      blockHash: natAccessKey.atMomentOf.blockHash,
      action: addAccessKey({
        publicKey: gasKeyPair.publicKey,
        permission: { kind: 'FullAccess' },
        gasPayment: { source: 'KeyBalance' },
        replayProtection: { channelCount: 2 },
      }),
      receiverAccountId: 'nat',
    },
  });

  await client.sendSignedTransaction({
    signedTransaction: addKeyTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  const aliceAccessKey = await client.getAccessKey({
    accountId: 'alice',
    publicKey: defaultKeyPair.publicKey,
  });

  const topUpTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'alice',
      signerPublicKey: defaultKeyPair.publicKey,
      nonce: getLastNonce(aliceAccessKey.accessKey) + 1,
      blockHash: aliceAccessKey.atMomentOf.blockHash,
      action: topUpAccessKeyBalance({ publicKey: gasKeyPair.publicKey, amount: { near: '1' } }),
      receiverAccountId: 'nat',
    },
  });

  await client.sendSignedTransaction({
    signedTransaction: topUpTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  const gasAccessKey = await client.getAccessKey({
    accountId: 'nat',
    publicKey: gasKeyPair.publicKey,
  });

  expect(gasAccessKey.accessKey.gasPayment).toMatchObject({
    source: 'KeyBalance',
    balance: { near: '1' },
  });
};
