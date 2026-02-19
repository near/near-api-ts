import type { NativeSignature } from '@universal/types/_common/crypto';
import type { InnerSignature } from '../../schemas/zod/common/signature';

export const toNativeSignature = ({
  u8Signature,
  curve,
}: InnerSignature): NativeSignature =>
  curve === 'ed25519'
    ? { ed25519Signature: { data: u8Signature } }
    : { secp256k1Signature: { data: u8Signature } };
