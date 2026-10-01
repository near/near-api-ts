import { expect } from 'vitest';
import { transfer } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { getLastNonce } from '../../../../../utils/getLastNonce';
import type { TestContext } from './general.test';

export const nonceInvalid = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const natAccessKey = await client.getAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  // Nonces have to grow, so the one the access key already holds is always too small.
  const nonce = getLastNonce(natAccessKey.accessKey);

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: defaultKeyPair.publicKey,
      nonce,
      blockHash: natAccessKey.atMomentOf.blockHash,
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
