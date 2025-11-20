import type { ResultOk, ResultErr } from 'nat-types/common';

export const result = {
  ok: <V>(value: V): ResultOk<V> => ({ ok: true, value }),
  err: <E>(error: E): ResultErr<E> => ({ ok: false, error }),
};
