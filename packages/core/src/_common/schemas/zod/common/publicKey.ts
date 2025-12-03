import * as z from 'zod/mini';
import { CurveStringSchema } from '@common/schemas/zod/common/common';
import { fromCurveString } from '@common/transformers/curveString';
import { BinaryCryptoKeyLengths } from '@common/configs/constants';

const { Ed25519, Secp256k1 } = BinaryCryptoKeyLengths;

export const PublicKeySchema = z
  .pipe(
    CurveStringSchema,
    z.transform((publicKey) => {
      const { curve, u8Data } = fromCurveString(publicKey);
      return { publicKey, curve, u8PublicKeyKey: u8Data };
    }),
  )
  .check(
    z.refine(
      ({ curve, u8PublicKeyKey }) =>
        curve === 'ed25519'
          ? u8PublicKeyKey.length === Ed25519.PublicKey
          : u8PublicKeyKey.length === Secp256k1.PublicKey,
      { error: 'Invalid public key length' },
    ),
  );
