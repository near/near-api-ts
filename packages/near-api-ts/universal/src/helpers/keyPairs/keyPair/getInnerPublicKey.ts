import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { BinaryLengths } from '../../../_common/configs/constants';
import { type InnerPrivateKey } from '../../../_common/schemas/zod/common/privateKey';
import {
  toEd25519CurveString,
  toMlDsa65CurveString,
  toSecp256k1CurveString,
} from '../../../_common/transformers/toCurveString';

const { Ed25519, Secp256k1 } = BinaryLengths;

export const getInnerPublicKey = ({ curve, privateKeyU8 }: InnerPrivateKey) => {
  switch (curve) {
    // ed25519 & secp256k1 store secret ‖ public, so slice off the public tail
    case 'ed25519': {
      const publicKeyU8 = privateKeyU8.slice(Ed25519.SecretKey);
      return {
        curve,
        publicKey: toEd25519CurveString(publicKeyU8),
        publicKeyU8,
      };
    }
    case 'secp256k1': {
      const publicKeyU8 = privateKeyU8.slice(Secp256k1.SecretKey);
      return {
        curve,
        publicKey: toSecp256k1CurveString(publicKeyU8),
        publicKeyU8,
      };
    }
    // ml-dsa-65 stores secret-only, so derive the public key from the whole secret
    case 'ml-dsa-65': {
      const publicKeyU8 = ml_dsa65.getPublicKey(privateKeyU8);
      return {
        curve,
        publicKey: toMlDsa65CurveString(publicKeyU8),
        publicKeyU8,
      };
    }
  }
};
