import type { Hex } from 'nat-types/_common/common';
import { BinaryCryptoKeyLengths } from '@common/configs/constants';
import { secp256k1 } from '@noble/curves/secp256k1';
import { result } from '@common/utils/result';
import { toSecp256k1CurveString } from '@common/transformers/curveString/toCurveString';

export const signBySecp256k1Key = (u8PrivateKey: Uint8Array, message: Hex) => {
  const u8SecretKey = u8PrivateKey.slice(
    0,
    BinaryCryptoKeyLengths.Secp256k1.SecretKey,
  );
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
