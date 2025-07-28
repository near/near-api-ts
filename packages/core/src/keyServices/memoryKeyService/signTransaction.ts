import { sha256 } from '@noble/hashes/sha2';
import { ed25519 } from '@noble/curves/ed25519';
import { base58 } from '@scure/base';
import { toBorshedTransaction } from '../../common/transaction/toBorshedTransaction';

export const signTransaction = (state: any) => async (transaction: any) => {
  const borshedTransaction = toBorshedTransaction(transaction);
  const u8TransactionHash = sha256(borshedTransaction);

  const u8Signature = ed25519.sign(
    u8TransactionHash,
    state.keys[transaction.signerPublicKey].u8SecretKey,
  );

  return {
    ...transaction,
    transactionHash: base58.encode(u8TransactionHash),
    signature: `ed25519:${base58.encode(u8Signature)}`,
  };
};
