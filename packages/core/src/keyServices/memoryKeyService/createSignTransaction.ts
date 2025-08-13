import { getTransactionHash } from '../../helpers/crypto/getTransactionHash';
import { sign } from '../../helpers/crypto/sign';
import type {
  Context,
  SignTransaction,
} from 'nat-types/keyServices/memoryKeyService';

export const createSignTransaction =
  (context: Context): SignTransaction =>
  async (transaction) => {
    // TODO Implement validation
    const privateKey = context.findPrivateKey(transaction.signerPublicKey);

    const { transactionHash, u8TransactionHash } =
      getTransactionHash(transaction);

    const { signature } = sign({ message: u8TransactionHash, privateKey });

    return {
      transaction,
      transactionHash,
      signature,
    };
  };
