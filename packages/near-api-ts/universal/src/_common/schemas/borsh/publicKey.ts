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

const MlDsa65PublicKeyBorshSchema = {
  struct: {
    mlDsa65Key: {
      struct: {
        data: { array: { type: 'u8', len: 1952 } },
      },
    },
  },
};

// Order matters — the enum index is the nearcore KeyType discriminant
// (ed25519 = 0, secp256k1 = 1, ml-dsa-65 = 2).
export const PublicKeyBorshSchema: Schema = {
  enum: [Ed25519PublicKeyBorshSchema, Secp256k1PublicKeyBorshSchema, MlDsa65PublicKeyBorshSchema],
};
