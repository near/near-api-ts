import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { toMlDsa65CurveString } from '../../../_common/transformers/toCurveString';
import { result } from '../../../_common/utils/result';

export const signByMlDsa65Key = (secretKeyU8: Uint8Array, dataU8: Uint8Array) => {
  // The stored private key is the whole 4032-byte secret (no public component),
  // so it is used as-is — there is no secret/public split to slice.
  const signatureU8 = ml_dsa65.sign(dataU8, secretKeyU8);

  return result.ok({
    curve: 'ml-dsa-65' as const,
    signature: toMlDsa65CurveString(signatureU8),
    signatureU8,
    dataU8,
  });
};
