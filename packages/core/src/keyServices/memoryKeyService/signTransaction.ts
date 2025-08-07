import * as v from 'valibot';
import { getTransactionHash } from '../../helpers/crypto/getTransactionHash';
import { sign } from '../../helpers/crypto/sign';
import type {
  Context,
  SignTransaction,
} from 'nat-types/keyServices/memoryKeyService';
import { TransactionSchema } from '@common/schemas/valibot/transaction';

export const createSignTransaction =
  (context: Context): SignTransaction =>
  async (transaction) => {
    const validTransaction = v.parse(TransactionSchema, transaction);
    const privateKey = context.findPrivateKey(validTransaction.signerPublicKey);

    const { transactionHash, u8TransactionHash } =
      getTransactionHash(validTransaction);

    const { signature } = sign({ message: u8TransactionHash, privateKey });

    return {
      transaction,
      transactionHash,
      signature,
    };
  };
