import type { Hex } from '../../../../types/_common/common';
import { BinaryLengths } from '../../../_common/configs/constants';
import { ed25519 } from '@noble/curves/ed25519';
import { result } from '../../../_common/utils/result';
import { toEd25519CurveString } from '../../../_common/transformers/toCurveString';

export const signByEd25519Key = (u8PrivateKey: Uint8Array, message: Hex) => {
  const u8SecretKey = u8PrivateKey.slice(0, BinaryLengths.Ed25519.SecretKey);
  const u8Signature = ed25519.sign(message, u8SecretKey);

  return result.ok({
    signature: toEd25519CurveString(u8Signature),
    curve: 'ed25519' as const,
    u8Signature,
  });
};
