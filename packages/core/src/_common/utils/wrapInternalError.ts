import { result } from '@common/utils/result';
import { createNatError, type NatError } from '@common/natError';
import type { NatInternalErrorKind } from 'nat-types/natError';
import type { ResultErr } from 'nat-types/_common/common';

export type WrapInternalError = {
  // #1
  <A extends unknown[], R, K extends NatInternalErrorKind>(
    kind: K,
    fn: (...args: A) => Promise<R>,
  ): (...args: A) => Promise<R | ResultErr<NatError<K>>>;
  // #2
  <A extends unknown[], R, K extends NatInternalErrorKind>(
    kind: K,
    fn: (...args: A) => R,
  ): (...args: A) => R | ResultErr<NatError<K>>;
};

const returnError = <K extends NatInternalErrorKind>(e: unknown, kind: K) =>
  result.err(
    createNatError<NatInternalErrorKind>({
      kind,
      context: { cause: e },
    }),
  );

/**
 * Wrap a function and convert *all* unexpected errors (sync or async)
 * into a `ResultErr`, guaranteeing that the wrapped function will
 * **never throw**.
 *
 * This is useful inside the library where we want total safety:
 * regardless of what the original function does — throws synchronously,
 * rejects a Promise, or produces any unknown failure — the wrapper
 * normalizes it into `ResultErr<string>`.
 *
 * After wrapping, the function is guaranteed to have a stable,
 * non-throwing contract:
 *   - sync  functions: R              → R | ResultErr<string>
 *   - async functions: Promise<R>     → Promise<R | ResultErr<string>>
 *
 * This creates a fully predictable and type-safe execution model,
 * ensuring that all internal "safe" functions behave consistently,
 * even if the underlying implementation misbehaves.
 */
export const wrapInternalError: WrapInternalError =
  (kind, fn: any) =>
  (...args: unknown[]) => {
    try {
      const res = fn(...args);
      if (res instanceof Promise) return res.catch((e) => returnError(e, kind));
      return res;
    } catch (e) {
      return returnError(e, kind);
    }
  };
