import type { ResultErr, ResultOk } from '../../../types/_common.ts';

export const result = {
  ok: <D>(data: D): ResultOk<D> => ({ success: true, data }),
  err: <E>(error: E): ResultErr<E> => ({ success: false, error }),
};
