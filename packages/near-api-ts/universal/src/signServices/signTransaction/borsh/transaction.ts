import type { Schema } from 'borsh';
import { ActionBorshSchema } from './actions/actions';
import { PublicKeyBorshSchema } from './publicKey';
import { SignatureBorshSchema } from './signature';

// Fields order is important and must follow the nearcore
export const TransactionBorshSchema: Schema = {
  struct: {
    signerId: 'string',
    publicKey: PublicKeyBorshSchema,
    nonce: 'u64',
    receiverId: 'string',
    blockHash: { array: { type: 'u8', len: 32 } },
    actions: { array: { type: ActionBorshSchema } },
  },
};

export const SignedTransactionBorshSchema: Schema = {
  struct: {
    transaction: TransactionBorshSchema,
    signature: SignatureBorshSchema,
  },
};
