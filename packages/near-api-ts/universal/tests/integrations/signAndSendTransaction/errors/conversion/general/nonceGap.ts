import { expect } from 'vitest';
import { transfer } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { getLastNonce } from '../../../../../utils/getLastNonce';
import type { TestContext } from './general.test';

/**
 * A consecutive nonce (the default) has to be exactly the next one. Nearcore checks it when the
 * transaction arrives, against the last nonce of the channel or of the transactions still
 * waiting in the pool, so a gap is rejected right away rather than held until it closes.
 */
export const nonceGap = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const natAccessKey = await client.getAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const nonce = getLastNonce(natAccessKey.accessKey) + 2;

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signer: {
        accountId: 'nat',
        publicKey: defaultKeyPair.publicKey,
        replayProtection: { scheme: 'NonceChannel', nonce },
      },
      recentBlockHash: natAccessKey.atMomentOf.blockHash,
      action: transfer({ amount: { near: '1' } }),
      receiverAccountId: 'bob',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Nonce.Invalid');
  expect(tx.error.context.info).toStrictEqual({
    transactionNonce: nonce,
    accessKeyNonce: getLastNonce(natAccessKey.accessKey),
  });
};
