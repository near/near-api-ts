import { expect } from 'vitest';
import { transfer } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/helpers/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import type { TestContext } from './general.test';

export const nonceInvalid = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  // Nonces have to grow, so the one the access key already holds is always too small.
  const nonce = accountAccessKey.nonce;

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: defaultKeyPair.publicKey,
      nonce,
      blockHash,
      action: transfer({ amount: { near: '1' } }),
      receiverAccountId: 'bob',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Nonce.Invalid');
  expect(tx.error.context.info).toStrictEqual({
    transactionNonce: nonce,
    accessKeyNonce: accountAccessKey.nonce,
  });
};
