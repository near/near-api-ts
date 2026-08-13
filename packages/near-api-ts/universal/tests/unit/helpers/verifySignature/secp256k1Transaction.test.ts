import { base58 } from '@scure/base';
import { expect, test } from 'vitest';
import { randomSecp256k1KeyPair, verifySignature } from '../../../../index';
import { signTransaction } from '../../../../src/createMemorySignService/signTransaction/signTransaction';

test('secp256k1 transaction verification', async () => {
  const keyPair = randomSecp256k1KeyPair();

  const signedTransaction = await signTransaction({
    signDataProvider: keyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: keyPair.publicKey,
      action: {
        actionType: 'Transfer',
        amount: { near: '1' },
      },
      receiverAccountId: 'bob',
      nonce: 0,
      blockHash: '6nrziuxAjeYvmtusxDhSvfPkXNUXDmQznKXebzE5wC1G',
    },
  });

  const isValid = verifySignature({
    publicKey: keyPair.publicKey,
    message: base58.decode(signedTransaction.transactionHash),
    signature: signedTransaction.signature,
  });

  expect(isValid).toBe(true);
});
