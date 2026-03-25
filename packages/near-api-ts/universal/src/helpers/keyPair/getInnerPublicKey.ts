import { BinaryLengths } from '../../_common/configs/constants';
import { type InnerPrivateKey } from '../../_common/schemas/zod/common/privateKey';
import type { InnerPublicKey } from '../../_common/schemas/zod/common/publicKey';
import {
  toEd25519CurveString,
  toSecp256k1CurveString,
} from '../../_common/transformers/toCurveString';

const { Ed25519, Secp256k1 } = BinaryLengths;

export const getInnerPublicKey = ({ curve, u8PrivateKey }: InnerPrivateKey): InnerPublicKey => {
  if (curve === 'ed25519') {
    const u8PublicKey = u8PrivateKey.slice(Ed25519.SecretKey);
    return {
      curve,
      publicKey: toEd25519CurveString(u8PublicKey),
      u8PublicKey,
    };
  }

  // Secp256k1
  const u8PublicKey = u8PrivateKey.slice(Secp256k1.SecretKey);

  return {
    curve,
    publicKey: toSecp256k1CurveString(u8PublicKey),
    u8PublicKey,
  };
};
