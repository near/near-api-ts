import * as z from 'zod/mini';
import { base58 } from '@scure/base';
import { result } from '@common/utils/result';
import { Base58StringSchema } from '@common/schemas/zod/common';
import { asThrowable } from '@common/utils/asThrowable';
import { createNatError } from '@common/natError';
import type { Curve, SafeFromCurveString } from 'nat-types/_common/curveString';

export const CurveStringSchema = z.templateLiteral([
  z.enum(['ed25519', 'secp256k1']),
  ':',
  Base58StringSchema,
]);

export const safeFromCurveString: SafeFromCurveString = (value) => {
  const curveString = CurveStringSchema.safeParse(value);

  if (!curveString.success)
    return result.err(
      createNatError({
        kind: 'FromCurveString.InvalidStringFormat',
        context: { zodError: curveString.error },
      }),
    );

  const [curve, base58String] = curveString.data.split(':');

  return result.ok({
    curve: curve as Curve,
    u8Data: base58.decode(base58String),
  });
};

// TODO remove after migration
export const fromCurveString = asThrowable(safeFromCurveString);
