import type { ResultErr, ResultOk } from '../../../../types/_common/common';
import type { CreateResultNatError } from '../../../../types/_common/natError';
import { createNatError } from './_common/natError';

export const result = {
  ok: <D>(data: D): ResultOk<D> => ({ success: true, data }),
  err: <E>(error: E): ResultErr<E> => ({ success: false, error }),
};

export const resultNatError: CreateResultNatError = (kind, context) =>
  // The declared return type spreads a union `kind` into a union of errors, one per kind. That
  // is the very same object at runtime, but TypeScript can't relate the two while the kind is
  // still a type parameter, so the error type is handed over as `never`.
  result.err(createNatError({ kind, context })) as ResultErr<never>;
