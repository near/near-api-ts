import * as v from 'valibot';
import { BinaryCryptoKeyLengths } from '../../configs/constants';

export const base58StringSchema = v.pipe(
  v.string(),
  v.regex(
    /^[1-9A-HJ-NP-Za-km-z]+$/,
    `Base58 string contains invalid characters. Allowed characters:\
     123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz`,
  ),
);

const { Ed25519, Secp256k1 } = BinaryCryptoKeyLengths;

export const binarySecp256k1PrivateKeySchema = v.pipe(
  v.instance(Uint8Array),
  v.length(
    Secp256k1.PrivateKey,
    `Length of binary Secp256k1 private key should be ${Secp256k1.PrivateKey}`,
  ),
  v.transform((u8PrivateKey) => ({
    u8SecretKey: u8PrivateKey.slice(0, Secp256k1.SecretKey),
    u8PublicKey: u8PrivateKey.slice(Secp256k1.SecretKey),
  })),
);

export const binaryEd25519PrivateKeySchema = v.pipe(
  v.instance(Uint8Array),
  v.length(
    Ed25519.PrivateKey,
    `Length of binary Ed25519 private key should be ${Ed25519.PrivateKey}`,
  ),
  v.transform((u8PrivateKey) => ({
    u8SecretKey: u8PrivateKey.slice(0, Ed25519.SecretKey),
    u8PublicKey: u8PrivateKey.slice(Ed25519.SecretKey),
  })),
);
