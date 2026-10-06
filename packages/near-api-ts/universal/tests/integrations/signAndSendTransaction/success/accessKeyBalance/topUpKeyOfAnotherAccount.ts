import { expect } from 'vitest';
import {
  addAccessKey,
  near,
  randomEd25519KeyPair,
  topUpAccessKeyBalance,
} from '../../../../../index';
import { signTransaction } from '../../../../../src/transaction/signTransaction/signTransaction';
import { getLastNonce } from '../../../../utils/getLastNonce';
import type { TestContext } from './accessKeyBalance.test';

// `nat` adds a key paid from its own balance, which starts empty, and `alice` tops it up - and
// pays for it: the amount comes from the signer, not from the account the key belongs to.
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
      signer: {
        accountId: 'nat',
        publicKey: defaultKeyPair.publicKey,
        replayProtection: {
          scheme: 'NonceChannel',
          nonce: getLastNonce(natAccessKey.accessKey) + 1,
        },
      },
      recentBlockHash: natAccessKey.atMomentOf.blockHash,
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

  const natBefore = await client.getAccountInfo({ accountId: 'nat' });
  const aliceBefore = await client.getAccountInfo({ accountId: 'alice' });

  const aliceAccessKey = await client.getAccessKey({
    accountId: 'alice',
    publicKey: defaultKeyPair.publicKey,
  });

  const topUpTransaction = await signTransaction({
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

  const natAfter = await client.getAccountInfo({ accountId: 'nat' });
  const aliceAfter = await client.getAccountInfo({ accountId: 'alice' });

  expect(natAfter.balance.total.yoctoNear).toBe(natBefore.balance.total.yoctoNear);

  // The signer pays the amount and the transaction fee on top of it
  const paid = aliceBefore.balance.total.sub(aliceAfter.balance.total);

  expect(paid.gt(near('1'))).toBe(true);
  expect(paid.lt(near('1.01'))).toBe(true);
};
