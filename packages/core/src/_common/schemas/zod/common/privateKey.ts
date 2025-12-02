import * as z from 'zod/mini';
import { CurveStringSchema } from '@common/schemas/zod/common/common';
import { fromCurveString } from '@common/transformers/curveString';
import { BinaryCryptoKeyLengths } from '@common/configs/constants';

const { Ed25519, Secp256k1 } = BinaryCryptoKeyLengths;

export const PrivateKeySchema = z
  .pipe(
    CurveStringSchema,
    z.transform((privateKey) => {
      const { curve, u8Data } = fromCurveString(privateKey);
      return { privateKey, curve, u8PrivateKey: u8Data };
    }),
  )
  .check(
    z.refine(
      ({ curve, u8PrivateKey }) =>
        curve === 'ed25519'
          ? u8PrivateKey.length === Ed25519.PrivateKey
          : u8PrivateKey.length === Secp256k1.PrivateKey,
      { error: 'Invalid private key length' },
    ),
  );
