import * as z from 'zod/mini';
import { BinaryLengths } from '../../../configs/constants';
import { CurveStringZodSchema } from './curveString';

const { Ed25519, Secp256k1 } = BinaryLengths;

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
      ({ curve, signatureU8 }) =>
        curve === 'ed25519'
          ? signatureU8.length === Ed25519.Signature
          : signatureU8.length === Secp256k1.Signature,
      { error: 'Invalid signature length' },
    ),
  );

export type InnerSignature = z.infer<typeof SignatureZodSchema>;
