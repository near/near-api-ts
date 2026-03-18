import { test, expect } from 'vitest';
import { createMemoryKeyService, randomSecp256k1KeyPair, verifySignature } from '../../../../index';
import { getTransactionHash } from '../../../../src/_common/utils/getTransactionHash';
import { TransactionSchema } from '../../../../src/_common/schemas/zod/transaction/transaction';

test('secp256k1 transaction verification', async () => {
  const keyPair = randomSecp256k1KeyPair();
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
