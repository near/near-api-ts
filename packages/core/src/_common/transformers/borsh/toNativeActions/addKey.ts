import type { AddKeyAction, NativeAddKeyAction } from 'nat-types/actions/addKey';

export const addKey = (action: AddKeyAction): NativeAddKeyAction => {
  return {

  }
}

// export const addEd25519FullAccessKey = ({ publicKey }: any) => {
//   return {
//     addKey: {
//       publicKey: {
//         ed25519Key: {
//           // data: extractData(publicKey),
//         },
//       },
//       accessKey: {
//         nonce: 0n, // deprecated field, only for compatibility
//         permission: {
//           fullAccess: {},
//         },
//       },
//     },
//   };
// };
//
// export const addSecp256k1FullAccessKey = ({ publicKey }: any) => {
//   return {
//     addKey: {
//       publicKey: {
//         secp256k1Key: {
//           // data: extractData(publicKey),
//         },
//       },
//       accessKey: {
//         nonce: 0n, // deprecated field, only for compatibility
//         permission: {
//           fullAccess: {},
//         },
//       },
//     },
//   };
// };
