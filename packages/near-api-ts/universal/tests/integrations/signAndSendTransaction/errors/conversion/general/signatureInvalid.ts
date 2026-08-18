import { expect } from 'vitest';
import { transfer } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/transaction/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import type { TestContext } from './general.test';

// An ed25519 signature is the last 64 bytes of the signed transaction.
const ED25519_SIGNATURE_LENGTH = 64;

export const signatureInvalid = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: defaultKeyPair.publicKey,
      nonce: accountAccessKey.nonce + 1,
      blockHash,
      action: transfer({ amount: { near: '1' } }),
      receiverAccountId: 'bob',
    },
  });

  // The transaction body stays untouched — only the signature is zeroed out, so the node
  // gets a well-formed transaction whose signature doesn't match the signer public key.
  const corruptedTransactionBorsh = Uint8Array.fromBase64(
    signedTransaction.signedTransactionBorsh64,
  );
  corruptedTransactionBorsh.fill(0, corruptedTransactionBorsh.length - ED25519_SIGNATURE_LENGTH);

  const tx = await client.safeSendSignedTransaction({
    signedTransaction: {
      transactionHash: signedTransaction.transactionHash,
      signedTransactionBorsh64: corruptedTransactionBorsh.toBase64(),
    },
  });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Signature.Invalid');
  expect(tx.error.context.info).toBe(null);
};
