import type {Hex} from 'nat-types/_common/common';
import {BinaryCryptoKeyLengths} from '@common/configs/constants';
import {ed25519} from '@noble/curves/ed25519';
import {result} from '@common/utils/result';
import {toEd25519CurveString} from '@common/transformers/curveString';

export const signByEd25519Key = (u8PrivateKey: Uint8Array, message: Hex) => {
  const u8SecretKey = u8PrivateKey.slice(
    0,
    BinaryCryptoKeyLengths.Ed25519.SecretKey,
  );
  const u8Signature = ed25519.sign(message, u8SecretKey);

  return result.ok({
    signature: toEd25519CurveString(u8Signature),
    curve: 'ed25519' as const,
    u8Signature,
  });
};
