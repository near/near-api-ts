import { secp256k1 } from '@noble/curves/secp256k1';
import { BinaryLengths } from '../../../_common/configs/constants';
import { toSecp256k1CurveString } from '../../../_common/transformers/toCurveString';
import { result } from '../../../_common/utils/result';

export const signBySecp256k1Key = (u8PrivateKey: Uint8Array, u8Message: Uint8Array) => {
  const u8SecretKey = u8PrivateKey.slice(0, BinaryLengths.Secp256k1.SecretKey);
  const signatureObj = secp256k1.sign(u8Message, u8SecretKey);

  // NEAR Protocol requires a 65-byte secp256k1 signature: 64 bytes (r + s) + 1 recovery byte.
  // The recovery byte (0 or 1) identifies which of the two possible public keys corresponds
  // to this signature, allowing NEAR's runtime to recover and verify the signer's public key
  // on-chain without it being passed explicitly.
  const u8Signature = new Uint8Array([...signatureObj.toBytes(), signatureObj.recovery]);

  return result.ok({
    signature: toSecp256k1CurveString(u8Signature),
    curve: 'secp256k1' as const,
    u8Signature,
  });
};
