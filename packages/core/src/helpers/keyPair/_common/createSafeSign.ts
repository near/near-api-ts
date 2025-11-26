import type { Hex } from 'nat-types/_common/common';
import { ed25519 } from '@noble/curves/ed25519';
import { secp256k1 } from '@noble/curves/secp256k1';
import {
  toEd25519CurveString,
  toSecp256k1CurveString,
} from '@common/transformers/curveString/toCurveString';
import { BinaryCryptoKeyLengths } from '@common/configs/constants';
import { result } from '@common/utils/result';
import { wrapUnknownError } from '@common/utils/wrapUnknownError';
import type { SafeSign } from 'nat-types/_common/keyPair';
import type { U8PrivateKey } from 'nat-types/_common/crypto';

const signByEd25519Key = (u8PrivateKey: Uint8Array, message: Hex) => {
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

const signBySecp256k1Key = (u8PrivateKey: Uint8Array, message: Hex) => {
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

export const createSafeSign = ({
  curve,
  u8PrivateKey,
}: U8PrivateKey): SafeSign =>
  wrapUnknownError('KeyPair.Sign.Unknown', (message) =>
    curve === 'ed25519'
      ? signByEd25519Key(u8PrivateKey, message)
      : signBySecp256k1Key(u8PrivateKey, message),
  );
