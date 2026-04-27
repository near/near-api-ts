import * as ed25519 from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha2.js';
import { toEd25519CurveString } from '../../../_common/transformers/toCurveString';
import { result } from '../../../_common/utils/result';

ed25519.hashes.sha512 = sha512;

export const signByEd25519Key = (secretKeyU8: Uint8Array, dataU8: Uint8Array) => {
  const signatureU8 = ed25519.sign(dataU8, secretKeyU8);

  return result.ok({
    curve: 'ed25519' as const,
    signature: toEd25519CurveString(signatureU8),
    signatureU8,
    dataU8,
  });
};
