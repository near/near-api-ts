import * as v from 'valibot';
import { BinaryCryptoKeyLengths } from '../../configs/constants';
import type { Curve, CurveString } from 'nat-types';
import { base58 } from '@scure/base';

export const Base58StringSchema = v.pipe(
  v.string(),
  v.regex(
    /^[1-9A-HJ-NP-Za-km-z]+$/,
    `Base58 string contains invalid characters. Allowed characters:\
     123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz`,
  ),
);

export const CurveStringSchema = v.pipe(
  v.string(),
  v.regex(
    /^(ed25519|secp256k1):[1-9A-HJ-NP-Za-km-z]+$/,
    'Invalid elliptic curve string format, expected <curve>:<base58>',
  ),
  v.transform((value) => value as CurveString),
);

export const CurveStringTransformSchema = v.pipe(
  CurveStringSchema,
  v.transform((value) => {
    const [curve, base58String] = value.split(':');
    return {
      curve: curve as Curve,
      u8Data: base58.decode(base58String),
    };
  }),
);

const { Ed25519, Secp256k1 } = BinaryCryptoKeyLengths;

export const BinarySecp256k1PrivateKeySchema = v.pipe(
  v.instance(Uint8Array),
  v.length(
    Secp256k1.PrivateKey,
    `Length of binary secp256k1 private key should be ${Secp256k1.PrivateKey}`,
  ),
);

export const BinaryEd25519PrivateKeySchema = v.pipe(
  v.instance(Uint8Array),
  v.length(
    Ed25519.PrivateKey,
    `Length of binary ed25519 private key should be ${Ed25519.PrivateKey}`,
  ),
);

// import { getRandomSecp256k1PrivateKey } from '../../crypto/getRandomPrivateKey';

// new Array(100).fill(0).forEach((_, i) => {
//   const { publicKey, privateKey } = getRandomSecp256k1PrivateKey();
//   console.log(
//     `Public key: ${publicKey}, privateKey: ${privateKey}`,
//     `Public key: ${publicKey.length}, privateKey: ${privateKey.length}`,
//   );
// });

// console.log(
//   v.parse(
//     PublicKeySchema,
//     'secp256k1:2k5acvmedoDyDm28qDknzd7R7gY7ndYwtTAbmn8P2bVuiXDCdFEi7KbbYxuXQArpTp9SveYYRgBP1LG9Jxwf1NGn2ad',
//     { abortEarly: true}
//   ),
// );
