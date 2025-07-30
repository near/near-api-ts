import * as z from 'zod/mini';
import { base58 } from '@scure/base';

/**
 * Represents the binary size of different crypto keys
 */
export const CryptoKeyLengths = {
  Ed25519: {
    // SecretKey + PublicKey
    PrivateKey: 64,
    SecretKey: 32,
    PublicKey: 32,
  },
  Secp256k1: {
    // SecretKey + PublicKey
    PrivateKey: 96,
    SecretKey: 32,
    PublicKey: 64,
  },
} as const;

export const EllipticCurveSchema = z.enum(['ed25519', 'secp256k1'], {
  error: (issue) =>
    `Unsupported curve: '${issue.input}'. Curve should be either 'ed25519' or 'secp256k1'`,
});

export const PrivateKeySchema = z.string().check((ctx) => {
  const [curve, curvelessKey] = ctx.value.split(':');

  if (!curve || !curvelessKey) {
    ctx.issues.push({
      code: 'custom',
      message: `Private key '${ctx.value}' must follow the 'curve:data' pattern`,
      input: ctx.value,
    });
    return;
  }

  // Validate curve type
  const ellipticCurveResult = EllipticCurveSchema.safeParse(curve);

  if (!ellipticCurveResult.success) {
    ctx.issues.push({
      code: 'custom',
      message: z.prettifyError(ellipticCurveResult.error),
      input: ctx.value,
    });
    return;
  }

  const u8PrivateKey = base58.decode(curvelessKey);

  // Validate ed25519 key length
  if (
    curve === 'ed25519' &&
    u8PrivateKey.length !== CryptoKeyLengths.Ed25519.PrivateKey
  ) {
    ctx.issues.push({
      code: 'custom',
      message: `Invalid private key length: ${u8PrivateKey.length}, must be ${CryptoKeyLengths.Ed25519.PrivateKey}`,
      input: ctx.value,
    });
    return;
  }

  // Validate secp256k1 key length
  if (
    curve === 'secp256k1' &&
    u8PrivateKey.length !== CryptoKeyLengths.Secp256k1.PrivateKey
  ) {
    ctx.issues.push({
      code: 'custom',
      message: `Invalid private key length: ${u8PrivateKey.length}, must be ${CryptoKeyLengths.Secp256k1.PrivateKey}`,
      input: ctx.value,
    });
    return;
  }
});
