import type { Schema } from 'borsh';

const Ed25519SignatureBorshSchema: Schema = {
  struct: { data: { array: { type: 'u8', len: 64 } } },
};

const Secp256k1SignatureBorshSchema: Schema = {
  struct: { data: { array: { type: 'u8', len: 65 } } },
};

export const signatureBorshSchema: Schema = {
  enum: [
    { struct: { ed25519Signature: Ed25519SignatureBorshSchema } },
    { struct: { secp256k1Signature: Secp256k1SignatureBorshSchema } },
  ],
};
