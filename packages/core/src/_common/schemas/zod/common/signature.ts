import * as z from 'zod/mini';
import { BinaryLengths } from '@common/configs/constants';
import { CurveStringSchema } from '@common/schemas/zod/common/curveString';

const { Ed25519, Secp256k1 } = BinaryLengths;

export const SignatureSchema = z
  .pipe(
    CurveStringSchema,
    z.transform((val) => ({
      signature: val.curveString,
      u8Signature: val.u8Data,
      curve: val.curve,
    })),
  )
  .check(
    z.refine(
      ({ curve, u8Signature }) =>
        curve === 'ed25519'
          ? u8Signature.length === Ed25519.Signature
          : u8Signature.length === Secp256k1.Signature,
      { error: 'Invalid signature length' },
    ),
  );

export type InnerSignature = z.infer<typeof SignatureSchema>;
