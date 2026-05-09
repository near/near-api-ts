import { expect, test } from 'vitest';
import { createMemoryKeyService, randomSecp256k1KeyPair, verifySignature } from '../../../../index';
import { TransactionZodSchema } from '../../../../src/_common/schemas/zod/transaction/transaction';
import { getTransactionHash } from '../../../../src/_common/utils/getTransactionHash';
import { signTransaction } from '../../../../src/helpers/signTransaction';

test('secp256k1 transaction verification', async () => {
  const keyPair = randomSecp256k1KeyPair();
  const keyService = createMemoryKeyService({ keySource: keyPair });

  const signedTransaction = await signTransaction({
    signDataProvider: keyService,
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

  const innerTx = TransactionZodSchema.parse(signedTransaction.transaction);
  const { u8TransactionHash } = getTransactionHash(innerTx);

  const isValid = verifySignature({
    publicKey: keyPair.publicKey,
    message: u8TransactionHash,
    signature: signedTransaction.signature,
  });

  expect(isValid).toBe(true);
});
