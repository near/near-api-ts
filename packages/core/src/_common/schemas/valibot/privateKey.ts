import { BinaryCryptoKeyLengths } from '../../configs/constants';
import * as v from 'valibot';

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
