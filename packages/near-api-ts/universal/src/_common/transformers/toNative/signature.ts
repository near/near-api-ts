import type { NativeSignature } from '../../../../types/_common/crypto';
import type { InnerSignature } from '../../schemas/zod/common/signature';

export const toNativeSignature = ({ signatureU8, curve }: InnerSignature): NativeSignature =>
  curve === 'ed25519'
    ? { ed25519Signature: { data: signatureU8 } }
    : { secp256k1Signature: { data: signatureU8 } };
