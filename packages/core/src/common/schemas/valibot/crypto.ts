import * as v from 'valibot';
import { BinaryCryptoKeyLengths } from '../../configs/constants';

export const Base58StringSchema = v.pipe(
  v.string(),
  v.regex(
    /^[1-9A-HJ-NP-Za-km-z]+$/,
    `Base58 string contains invalid characters. Allowed characters:\
     123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz`,
  ),
);

export const CurveSchema = v.picklist(['ed25519', 'secp256k1']);

export const CurveStringSchema = v.pipe(
  v.string(),
  v.regex(
    /^(ed25519|secp256k1):[1-9A-HJ-NP-Za-km-z]+$/,
    'Invalid elliptic curve string format, expected {curve}:{base58}',
  ),
);

const { Ed25519, Secp256k1 } = BinaryCryptoKeyLengths;

export const BinarySecp256k1PrivateKeySchema = v.pipe(
  v.instance(Uint8Array),
  v.length(
    Secp256k1.PrivateKey,
    `Length of binary Secp256k1 private key should be ${Secp256k1.PrivateKey}`,
  ),
);

export const BinaryEd25519PrivateKeySchema = v.pipe(
  v.instance(Uint8Array),
  v.length(
    Ed25519.PrivateKey,
    `Length of binary Ed25519 private key should be ${Ed25519.PrivateKey}`,
  ),
);
