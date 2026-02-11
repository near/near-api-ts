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

export const signatureBorshSchema: Schema = {
  enum: [Ed25519SignatureBorshSchema, Secp256k1SignatureBorshSchema],
};
