import * as z from 'zod/mini';
import { PublicKeySchema } from '@universal/src/_common/schemas/zod/common/publicKey';
import { ed25519 } from '@noble/curves/ed25519';
import { SignatureSchema } from '@universal/src/_common/schemas/zod/common/signature';
import type {
  SafeVerifySignature,
  VerifySignature,
} from '@universal/types/_common/verifySignature';
import { result } from '@universal/src/_common/utils/result';
import { resultNatError } from '@universal/src/_common/natError';
import { wrapInternalError } from '@universal/src/_common/utils/wrapInternalError';
import { asThrowable } from '@universal/src/_common/utils/asThrowable';

export const VerifySignatureArgsSchema = z.object({
  publicKey: PublicKeySchema,
  message: z.instanceof(Uint8Array),
  signature: SignatureSchema,
});

export const safeVerifySignature: SafeVerifySignature = wrapInternalError(
  'VerifySignature.Internal',
  (args) => {
    const validArgs = VerifySignatureArgsSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('VerifySignature.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    const { publicKey, signature, message } = validArgs.data;

    if (publicKey.curve === 'ed25519') {
      return result.ok(ed25519.verify(signature.u8Signature, message, publicKey.u8PublicKey));
    }

    return result.ok(false);
  },
);

export const verifySignature: VerifySignature = asThrowable(safeVerifySignature);
