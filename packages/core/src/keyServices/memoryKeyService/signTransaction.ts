// import * as v from 'valibot';
import { getTransactionHash } from '../../helpers/crypto/getTransactionHash';
import { sign } from '../../helpers/crypto/sign';
import type {
  Context,
  SignTransaction,
} from 'nat-types/keyServices/memoryKeyService';
// import { TransactionSchema } from '@common/schemas/valibot/transaction';

export const createSignTransaction =
  (context: Context): SignTransaction =>
  async (transaction) => {
  // TODO Implement validation
    // const validTransaction = v.parse(TransactionSchema, transaction);
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
