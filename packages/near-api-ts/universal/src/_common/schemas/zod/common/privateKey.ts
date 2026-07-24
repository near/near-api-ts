import * as z from 'zod/mini';
import { BinaryLengths } from '../../../configs/constants';
import { CurveStringZodSchema } from './curveString';

const { Ed25519, Secp256k1, MlDsa65 } = BinaryLengths;

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
      ({ curve, privateKeyU8 }) => {
        switch (curve) {
          case 'ed25519':
            return privateKeyU8.length === Ed25519.PrivateKey;
          case 'secp256k1':
            return privateKeyU8.length === Secp256k1.PrivateKey;
          case 'ml-dsa-65':
            return privateKeyU8.length === MlDsa65.PrivateKey;
          default:
            return false;
        }
      },
      { error: 'Invalid private key length' },
    ),
  );

export type InnerPrivateKey = z.infer<typeof PrivateKeyZodSchema>;
