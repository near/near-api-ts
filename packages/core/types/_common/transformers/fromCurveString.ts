import type { Curve, CurveString } from 'nat-types/crypto';
import type { Result } from 'nat-types/common';
import { NatError } from '@common/natError';
import type { $ZodError } from 'zod/v4/core';

type InvalidFormat = {
  kind: 'FromCurveString.InvalidFormat';
  context: { zodError: $ZodError };
};

export type FromCurveStringErrors = InvalidFormat;

export type SafeFromCurveString = (
  value: CurveString,
) => Result<
  { curve: Curve; u8Data: Uint8Array },
  NatError<'FromCurveString.InvalidFormat'>
>;
