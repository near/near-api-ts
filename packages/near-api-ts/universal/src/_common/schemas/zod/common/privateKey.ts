import * as z from 'zod/mini';
import { BinaryLengths } from '../../../configs/constants';
import { CurveStringSchema } from './curveString';

const { Ed25519, Secp256k1 } = BinaryLengths;

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

export type InnerPrivateKey = z.infer<typeof PrivateKeySchema>;
