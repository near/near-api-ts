import * as z from 'zod/mini';
import { BinaryLengths } from '../../../configs/constants';
import { CurveStringZodSchema } from './curveString';

const { Ed25519, Secp256k1, MlDsa65 } = BinaryLengths;

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
      ({ curve, publicKeyU8 }) => {
        switch (curve) {
          case 'ed25519':
            return publicKeyU8.length === Ed25519.PublicKey;
          case 'secp256k1':
            return publicKeyU8.length === Secp256k1.PublicKey;
          case 'ml-dsa-65':
            return publicKeyU8.length === MlDsa65.PublicKey;
          default:
            return false;
        }
      },
      { error: 'Invalid public key length' },
    ),
  );

export type InnerPublicKey = z.infer<typeof PublicKeyZodSchema>;
