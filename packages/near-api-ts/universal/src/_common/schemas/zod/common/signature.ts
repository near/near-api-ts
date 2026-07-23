import * as z from 'zod/mini';
import { BinaryLengths } from '../../../configs/constants';
import { CurveStringZodSchema } from './curveString';

const { Ed25519, Secp256k1, MlDsa65 } = BinaryLengths;

export const SignatureZodSchema = z
  .pipe(
    CurveStringZodSchema,
    z.transform((val) => ({
      signature: val.curveString,
      signatureU8: val.dataU8,
      curve: val.curve,
    })),
  )
  .check(
    z.refine(
      ({ curve, signatureU8 }) => {
        switch (curve) {
          case 'ed25519':
            return signatureU8.length === Ed25519.Signature;
          case 'secp256k1':
            return signatureU8.length === Secp256k1.Signature;
          case 'ml-dsa-65':
            return signatureU8.length === MlDsa65.Signature;
          default:
            return false;
        }
      },
      { error: 'Invalid signature length' },
    ),
  );

export type InnerSignature = z.infer<typeof SignatureZodSchema>;
