import type { Schema } from 'borsh';

const Ed25519SignatureBorshSchema = {
  struct: {
    ed25519Signature: {
      struct: {
        data: { array: { type: 'u8', len: 64 } },
      },
    },
  },
};

const Secp256k1SignatureBorshSchema = {
  struct: {
    secp256k1Signature: {
      struct: {
        data: { array: { type: 'u8', len: 65 } },
      },
    },
  },
};

const MlDsa65SignatureBorshSchema = {
  struct: {
    mlDsa65Signature: {
      struct: {
        data: { array: { type: 'u8', len: 3309 } },
      },
    },
  },
};

// Order matters — the enum index is the nearcore KeyType discriminant
// (ed25519 = 0, secp256k1 = 1, ml-dsa-65 = 2).
export const SignatureBorshSchema: Schema = {
  enum: [Ed25519SignatureBorshSchema, Secp256k1SignatureBorshSchema, MlDsa65SignatureBorshSchema],
};
