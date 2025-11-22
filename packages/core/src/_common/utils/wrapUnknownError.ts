import type { ResultErr } from 'nat-types/common';
import { result } from '@common/utils/result';

type WrapUnknownError = {
  <A extends unknown[], R>(
    safeFn: (...args: A) => Promise<R>,
  ): (...args: A) => Promise<R | ResultErr<string>>;
  <A extends unknown[], R>(
    safeFn: (...args: A) => R,
  ): (...args: A) => R | ResultErr<string>;
};

const returnError = (e: unknown) =>
  result.err(new Error('Unknown error', { cause: e })); // TODO Use NatError

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
export const wrapUnknownError: WrapUnknownError =
  (safeFn: any) =>
  (...args: unknown[]) => {
    try {
      const res = safeFn(...args);
      if (res instanceof Promise) return res.catch((e) => returnError(e));
      return res;
    } catch (e) {
      return returnError(e);
    }
  };
