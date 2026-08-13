import type { ResultErr, ResultOk } from '../../../types/_common/common';
import type { CreateResultNatError } from '../../../types/_common/natError';
import { createNatError } from './_common/natError';

export const result = {
  ok: <V>(value: V): ResultOk<V> => ({ ok: true, value }),
  err: <E>(error: E): ResultErr<E> => ({ ok: false, error }),
};

export const resultNatError: CreateResultNatError = (kind, context) =>
  result.err(createNatError({ kind, context }));
