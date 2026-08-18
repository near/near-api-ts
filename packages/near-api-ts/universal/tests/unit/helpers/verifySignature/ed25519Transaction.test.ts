import { base58 } from '@scure/base';
import { expect, test } from 'vitest';
import { randomEd25519KeyPair, verifySignature } from '../../../../index';
import { signTransaction } from '../../../../src/transaction/signTransaction/signTransaction';

test('ed25519 transaction verification', async () => {
  const keyPair = randomEd25519KeyPair();

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
