import { sha256 } from '@noble/hashes/sha2';
import { base58 } from '@scure/base';
import { serializeTransactionToBorsh } from '../../common/transaction/borshTransaction';
import { type Transaction } from '../../common/transaction/borshTransaction';
import { sign } from '../../common/crypto/sign';

export const signTransaction =
  (state: any) => async (transaction: Transaction) => {
    const serializedTransaction = serializeTransactionToBorsh(transaction);
    const u8TransactionHash = sha256(serializedTransaction);

    const signature = sign({
      message: u8TransactionHash,
      privateKey: state.keys[transaction.signerPublicKey].privateKey,
    });

    return {
      transaction,
      transactionHash: base58.encode(u8TransactionHash),
      signature,
    };
  };
