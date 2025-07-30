// import {secp256k1} from '@noble/curves/esm/secp256k1';
// import {base58} from '@scure/base/lib/esm';
//
// const fn = () => {
//   const u8SecretKey = secp256k1.utils.randomSecretKey();
//   // nearcore expects uncompressed public key without header 0x04
//   const u8PublicKey = secp256k1.getPublicKey(u8SecretKey, false);
//   const u8PublicKeyWithoutHeader = u8PublicKey.slice(1);
//
//   const u8PrivateKey = new Uint8Array([
//     ...u8SecretKey,
//     ...u8PublicKeyWithoutHeader,
//   ]);
//
//   return {
//     publicKey: `secp256k1:${base58.encode(u8PublicKeyWithoutHeader)}`,
//     privateKey: `secp256k1:${base58.encode(u8PrivateKey)}`,
//   };
// };
