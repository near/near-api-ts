import type { Schema } from 'borsh';

const Ed25519PublicKeyBorshSchema = {
  struct: {
    ed25519Key: {
      struct: {
        data: { array: { type: 'u8', len: 32 } },
      },
    },
  },
};

const Secp256k1PublicKeyBorshSchema = {
  struct: {
    secp256k1Key: {
      struct: {
        data: { array: { type: 'u8', len: 64 } },
      },
    },
  },
};

export const publicKeyBorshSchema: Schema = {
  enum: [Ed25519PublicKeyBorshSchema, Secp256k1PublicKeyBorshSchema],
};
