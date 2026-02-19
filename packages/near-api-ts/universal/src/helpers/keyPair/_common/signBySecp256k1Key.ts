import { secp256k1 } from '@noble/curves/secp256k1';
import type { Hex } from '@universal/types/_common/common';
import { BinaryLengths } from '../../../_common/configs/constants';
import { toSecp256k1CurveString } from '../../../_common/transformers/toCurveString';
import { result } from '../../../_common/utils/result';

export const signBySecp256k1Key = (u8PrivateKey: Uint8Array, message: Hex) => {
  const u8SecretKey = u8PrivateKey.slice(0, BinaryLengths.Secp256k1.SecretKey);
  const signatureObj = secp256k1.sign(message, u8SecretKey);

  const u8Signature = new Uint8Array([
    ...signatureObj.toBytes(),
    signatureObj.recovery,
  ]);

  return result.ok({
    signature: toSecp256k1CurveString(u8Signature),
    curve: 'secp256k1' as const,
    u8Signature,
  });
};
