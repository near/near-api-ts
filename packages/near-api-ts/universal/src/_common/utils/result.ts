import type { ResultErr, ResultOk } from '../../../types/_common/common';

export const result = {
  ok: <V>(value: V): ResultOk<V> => ({ ok: true, value }),
  err: <E>(error: E): ResultErr<E> => ({ ok: false, error }),
};
