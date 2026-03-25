import { expect, test } from 'vitest';
import { createMemoryKeyService, randomEd25519KeyPair, verifySignature } from '../../../../index';
import { TransactionSchema } from '../../../../src/_common/schemas/zod/transaction/transaction';
import { getTransactionHash } from '../../../../src/_common/utils/getTransactionHash';

test('ed25519 transaction verification', async () => {
  const keyPair = randomEd25519KeyPair();
  const keyService = createMemoryKeyService({ keySource: keyPair });

  const signedTransaction = await keyService.signTransaction({
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

  const innerTx = TransactionSchema.parse(signedTransaction.transaction);
  const { u8TransactionHash } = getTransactionHash(innerTx);

  const isValid = verifySignature({
    publicKey: keyPair.publicKey,
    message: u8TransactionHash,
    signature: signedTransaction.signature,
  });

  expect(isValid).toBe(true);
});
