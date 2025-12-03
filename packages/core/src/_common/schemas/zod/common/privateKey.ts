import * as z from 'zod/mini';
import { BinaryCryptoKeyLengths } from '@common/configs/constants';
import { CurveStringSchema } from '@common/schemas/zod/common/curveString';

const { Ed25519, Secp256k1 } = BinaryCryptoKeyLengths;

export const PrivateKeySchema = z
  .pipe(
    CurveStringSchema,
    z.transform((val) => ({
      privateKey: val.curveString,
      u8PrivateKey: val.u8Data,
      curve: val.curve,
    })),
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
