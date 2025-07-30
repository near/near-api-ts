import type { Schema } from 'borsh';
import { transactionBorshSchema } from './transaction';
import { signatureBorshSchema } from './signature';

export const signedTransactionBorshSchema: Schema = {
  struct: {
    transaction: transactionBorshSchema,
    signature: signatureBorshSchema,
  },
};
