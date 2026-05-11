import { BinaryLengths } from '../../../_common/configs/constants';
import { type InnerPrivateKey } from '../../../_common/schemas/zod/common/privateKey';
import {
  toEd25519CurveString,
  toSecp256k1CurveString,
} from '../../../_common/transformers/toCurveString';

const { Ed25519, Secp256k1 } = BinaryLengths;

export const getInnerPublicKey = ({ curve, privateKeyU8 }: InnerPrivateKey) => {
  // ed25519
  if (curve === 'ed25519') {
    const publicKeyU8 = privateKeyU8.slice(Ed25519.SecretKey);
    return {
      curve,
      publicKey: toEd25519CurveString(publicKeyU8),
      publicKeyU8,
    };
  }

  // secp256k1
  const publicKeyU8 = privateKeyU8.slice(Secp256k1.SecretKey);

  return {
    curve,
    publicKey: toSecp256k1CurveString(publicKeyU8),
    publicKeyU8,
  };
};
