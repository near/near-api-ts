import * as v from 'valibot';
import type { Ed25519PublicKey, Secp256k1PublicKey } from 'nat-types/crypto';

const Ed25519PublicKeySchema = v.pipe(
  v.string(),
  v.regex(
    /^ed25519:[1-9A-HJ-NP-Za-km-z]+$/,
    'Invalid public key format, expected ed25519:<base58>',
  ),
  v.check(
    (value) => value.length === 51 || value.length === 52,
    'Ed25519 public key string must be 51 or 52 characters long',
  ),
  v.transform((value) => value as Ed25519PublicKey),
);

const Secp256k1PublicKeySchema = v.pipe(
  v.string(),
  v.regex(
    /^secp256k1:[1-9A-HJ-NP-Za-km-z]+$/,
    'Invalid public key format, expected secp256k1:<base58>',
  ),
  v.check(
    (value) => value.length === 97 || value.length === 98,
    'Secp256k1 public key string must be 97 or 98 characters long',
  ),
  v.transform((value) => value as Secp256k1PublicKey),
);

export const PublicKeySchema = v.union(
  [Ed25519PublicKeySchema, Secp256k1PublicKeySchema],
  'Invalid public key',
);
