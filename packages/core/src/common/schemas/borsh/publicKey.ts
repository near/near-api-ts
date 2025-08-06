import type { Schema } from 'borsh';

const Ed25519KeyBorshSchema: Schema = {
  struct: { data: { array: { type: 'u8', len: 32 } } },
};

const Secp256k1KeyBorshSchema: Schema = {
  struct: { data: { array: { type: 'u8', len: 64 } } },
};

export const publicKeyBorshSchema: Schema = {
  enum: [
    { struct: { ed25519Key: Ed25519KeyBorshSchema } },
    { struct: { secp256k1Key: Secp256k1KeyBorshSchema } },
  ],
};
