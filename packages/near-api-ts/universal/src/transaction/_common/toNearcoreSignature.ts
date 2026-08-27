import type { NearcoreSignature } from '../../../types/_common/crypto';
import type { InnerSignature } from '../../_common/zodSchemas/signature';

export const toNearcoreSignature = ({ signatureU8, curve }: InnerSignature): NearcoreSignature => {
  switch (curve) {
    case 'ed25519':
      return { ed25519Signature: { data: signatureU8 } };
    case 'secp256k1':
      return { secp256k1Signature: { data: signatureU8 } };
    case 'ml-dsa-65':
      return { mlDsa65Signature: { data: signatureU8 } };
  }
};
