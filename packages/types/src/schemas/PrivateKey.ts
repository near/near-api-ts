// import * as z from 'zod/mini';
// import { base58 } from '@scure/base';
//
// /**
//  * Represents the binary size of different crypto keys
//  */
//
//
// export const EllipticCurveSchema = z.enum(['ed25519', 'secp256k1'], {
//   error: (issue) =>
//     `Unsupported curve: '${issue.input}'. Curve should be either 'ed25519' or 'secp256k1'`,
// });
//
// // TODO: validate base58 string
// export const PrivateKeySchema = z.string().check((ctx) => {
//   const [curve, curvelessKey] = ctx.value.split(':');
//
//   if (!curve || !curvelessKey) {
//     ctx.issues.push({
//       code: 'custom',
//       message: `Private key '${ctx.value}' must follow the 'curve:base58Data' pattern`,
//       input: ctx.value,
//     });
//     return;
//   }
//
//   // Validate curve type
//   const ellipticCurveResult = EllipticCurveSchema.safeParse(curve);
//
//   if (!ellipticCurveResult.success) {
//     ctx.issues.push({
//       code: 'custom',
//       message: z.prettifyError(ellipticCurveResult.error),
//       input: ctx.value,
//     });
//     return;
//   }
//
//   // TODO validate
//   const u8PrivateKey = base58.decode(curvelessKey);
//
//   // Validate ed25519 key length
//   if (
//     curve === 'ed25519' &&
//     u8PrivateKey.length !== CryptoKeyLengths.Ed25519.PrivateKey
//   ) {
//     ctx.issues.push({
//       code: 'custom',
//       message: `Invalid binary private key length: ${u8PrivateKey.length}, must be ${CryptoKeyLengths.Ed25519.PrivateKey}`,
//       input: ctx.value,
//     });
//     return;
//   }
//
//   // Validate secp256k1 key length
//   if (
//     curve === 'secp256k1' &&
//     u8PrivateKey.length !== CryptoKeyLengths.Secp256k1.PrivateKey
//   ) {
//     ctx.issues.push({
//       code: 'custom',
//       message: `Invalid private key length: ${u8PrivateKey.length}, must be ${CryptoKeyLengths.Secp256k1.PrivateKey}`,
//       input: ctx.value,
//     });
//     return;
//   }
// });
