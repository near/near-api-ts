import { expect } from 'vitest';
import { randomEd25519KeyPair, transfer } from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/createMemorySignService/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import type { TestContext } from '../signer.test';

export const notFound = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  // A freshly generated key pair is not attached to `nat`. The signature is still
  // valid for the public key stated in the transaction, so the node gets past the
  // signature check and fails while looking up the access key.
  const detachedKeyPair = randomEd25519KeyPair();

  const { blockHash } = await client.getAccountAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: detachedKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: detachedKeyPair.publicKey,
      nonce: 1,
      blockHash,
      action: transfer({ amount: { near: '1' } }),
      receiverAccountId: 'bob',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Signer.AccessKey.NotFound');
  expect(tx.error.context.info).toStrictEqual({
    signerAccountId: 'nat',
    signerPublicKey: detachedKeyPair.publicKey,
  });
};
