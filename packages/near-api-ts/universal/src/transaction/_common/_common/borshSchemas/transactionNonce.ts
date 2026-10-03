import type { Schema } from 'borsh';

// Nearcore `TransactionNonce`, shared by `TransactionV1` and `DelegateActionV2`. The variants'
// order is important and must match nearcore: a plain nonce for a key with one nonce channel,
// a nonce with its channel (`nonceIndex`, u16) for a key with many.
export const TransactionNonceBorshSchema: Schema = {
  enum: [
    {
      struct: {
        nonce: {
          struct: { nonce: 'u64' },
        },
      },
    },
    {
      struct: {
        gasKeyNonce: {
          struct: { nonce: 'u64', nonceIndex: 'u16' },
        },
      },
    },
  ],
};
