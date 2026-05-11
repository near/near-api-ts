import * as z from 'zod/mini';
import { BinaryLengths } from '../../../configs/constants';
import { CurveStringZodSchema } from './curveString';

const { Ed25519, Secp256k1 } = BinaryLengths;

export const PublicKeyZodSchema = z
  .pipe(
    CurveStringZodSchema,
    z.transform((val) => ({
      publicKey: val.curveString,
      publicKeyU8: val.dataU8,
      curve: val.curve,
    })),
  )
  .check(
    z.refine(
      ({ curve, publicKeyU8 }) =>
        curve === 'ed25519'
          ? publicKeyU8.length === Ed25519.PublicKey
          : publicKeyU8.length === Secp256k1.PublicKey,
      { error: 'Invalid public key length' },
    ),
  );

export type InnerPublicKey = z.infer<typeof PublicKeyZodSchema>;
