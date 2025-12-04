import * as z from 'zod/mini';
import { BinaryLengths } from '@common/configs/constants';
import { CurveStringSchema } from '@common/schemas/zod/common/curveString';

const { Ed25519, Secp256k1 } = BinaryLengths;

export const PublicKeySchema = z
  .pipe(
    CurveStringSchema,
    z.transform((val) => ({
      publicKey: val.curveString,
      u8PublicKey: val.u8Data,
      curve: val.curve,
    })),
  )
  .check(
    z.refine(
      ({ curve, u8PublicKey }) =>
        curve === 'ed25519'
          ? u8PublicKey.length === Ed25519.PublicKey
          : u8PublicKey.length === Secp256k1.PublicKey,
      { error: 'Invalid public key length' },
    ),
  );

export type InnerPublicKey = z.infer<typeof PublicKeySchema>;
