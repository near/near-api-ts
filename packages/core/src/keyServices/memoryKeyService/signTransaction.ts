import { sha256 } from '@noble/hashes/sha2';
import { base58 } from '@scure/base';
import { serializeTransactionToBorsh } from '../../common/transformers/borshTransaction';
import { sign } from '../../common/crypto/sign';
import type {
  Context,
  SignTransaction,
} from 'nat-types/keyServices/memoryKeyService';

export const createSignTransaction =
  (context: Context): SignTransaction =>
  async (transaction) => {
    // TODO Add validation for transaction
    const serializedTransaction = serializeTransactionToBorsh(transaction);
    const u8TransactionHash = sha256(serializedTransaction);

    const { signature } = sign({
      message: u8TransactionHash,
      privateKey: context.keyPairs[transaction.signerPublicKey].privateKey,
    });

    return {
      transaction,
      transactionHash: base58.encode(u8TransactionHash),
      signature,
    };
  };
