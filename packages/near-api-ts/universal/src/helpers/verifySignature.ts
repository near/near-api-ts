import * as ed25519 from '@noble/ed25519';
import { hmac } from '@noble/hashes/hmac.js';
import { sha256, sha512 } from '@noble/hashes/sha2.js';
import * as secp256k1 from '@noble/secp256k1';
import * as z from 'zod/mini';
import type { SafeVerifySignature, VerifySignature } from '../../types/_common/verifySignature';
import { resultNatError } from '../_common/natError';
import { PublicKeyZodSchema } from '../_common/schemas/zod/common/publicKey';
import { SignatureZodSchema } from '../_common/schemas/zod/common/signature';
import { asThrowable } from '../_common/utils/asThrowable';
import { result } from '../_common/utils/result';
import { wrapInternalError } from '../_common/utils/wrapInternalError';

ed25519.hashes.sha512 = sha512;
secp256k1.hashes.hmacSha256 = (key, msg) => hmac(sha256, key, msg);
secp256k1.hashes.sha256 = sha256;

export const VerifySignatureArgsSchema = z.object({
  publicKey: PublicKeyZodSchema,
  message: z.instanceof(Uint8Array),
  signature: SignatureZodSchema,
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

    // NEAR Protocol stores secp256k1 signatures as 65 bytes: [r (32) | s (32) |
    // recovery_id (1)].
    //
    // The recovery byte is only needed to reconstruct the public key, not for
    // verification, so we strip it with subarray(0, 64).
    //
    // Public keys are stored as 64 raw bytes (x || y coordinates) without any prefix,
    // because NEAR always expects 64-byte keys. However, @noble/curves requires the
    // standard SEC1 uncompressed point format (65 bytes: 0x04 || x || y),
    // so we prepend the 0x04 prefix on the fly.
    //
    // prehash: false — NEAR passes an already SHA-256-hashed message to sign/verify,
    // so we must not hash it again inside the library.

    return result.ok(
      secp256k1.verify(
        signature.u8Signature.subarray(0, 64),
        message,
        new Uint8Array([0x04, ...publicKey.u8PublicKey]),
        { prehash: false },
      ),
    );
  },
);

export const verifySignature: VerifySignature = asThrowable(safeVerifySignature);
