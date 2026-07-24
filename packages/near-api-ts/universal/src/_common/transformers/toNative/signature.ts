import type { NativeSignature } from '../../../../types/_common/crypto';
import type { InnerSignature } from '../../schemas/zod/common/signature';

export const toNativeSignature = ({ signatureU8, curve }: InnerSignature): NativeSignature => {
  switch (curve) {
    case 'ed25519':
      return { ed25519Signature: { data: signatureU8 } };
    case 'secp256k1':
      return { secp256k1Signature: { data: signatureU8 } };
    case 'ml-dsa-65':
      return { mlDsa65Signature: { data: signatureU8 } };
  }
};
