import * as z from 'zod/mini';
import { BinaryLengths } from '../../../configs/constants';
import { CurveStringZodSchema } from './curveString';

const { Ed25519, Secp256k1 } = BinaryLengths;

export const PrivateKeyZodSchema = z
  .pipe(
    CurveStringZodSchema,
    z.transform((val) => ({
      privateKey: val.curveString,
      privateKeyU8: val.dataU8,
      curve: val.curve,
    })),
  )
  .check(
    z.refine(
      ({ curve, privateKeyU8 }) =>
        curve === 'ed25519'
          ? privateKeyU8.length === Ed25519.PrivateKey
          : privateKeyU8.length === Secp256k1.PrivateKey,
      { error: 'Invalid private key length' },
    ),
  );

export type InnerPrivateKey = z.infer<typeof PrivateKeyZodSchema>;
