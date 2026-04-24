import { hmac } from '@noble/hashes/hmac.js';
import { sha256 } from '@noble/hashes/sha2.js';
import * as secp256k1 from '@noble/secp256k1';
import { BinaryLengths } from '../../../_common/configs/constants';
import { toSecp256k1CurveString } from '../../../_common/transformers/toCurveString';
import { result } from '../../../_common/utils/result';

// @noble/secp256k1 requirements
secp256k1.hashes.hmacSha256 = (key, msg) => hmac(sha256, key, msg);
secp256k1.hashes.sha256 = sha256;

export const signBySecp256k1Key = (u8PrivateKey: Uint8Array, u8Message: Uint8Array) => {
  const u8SecretKey = u8PrivateKey.slice(0, BinaryLengths.Secp256k1.SecretKey);
  const recoveredSignature = secp256k1.sign(u8Message, u8SecretKey, {
    // NEAR signs already hashed 32-byte messages.
    prehash: false,
    format: 'recovered',
  });

  // NEAR Protocol requires a 65-byte secp256k1 signature: 64 bytes (r + s) + 1 recovery byte.
  // The recovery byte (0 or 1) identifies which of the two possible public keys corresponds
  // to this signature, allowing NEAR's runtime to recover and verify the signer's public key
  // on-chain without it being passed explicitly.
  // @noble/secp256k1 v3 recovered format is [recovery (1) | r (32) | s (32)].
  // Convert it to NEAR format: [r (32) | s (32) | recovery (1)].
  const u8Signature = new Uint8Array([...recoveredSignature.subarray(1), recoveredSignature[0]!]);

  return result.ok({
    signature: toSecp256k1CurveString(u8Signature),
    curve: 'secp256k1' as const,
    u8Signature,
  });
};
