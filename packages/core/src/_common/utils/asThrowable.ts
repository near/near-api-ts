import type { Result } from 'nat-types/_common/common';

type AsThrowable = {
  <A extends unknown[], V, E>(
    safeFn: (...args: A) => Result<V, E>,
  ): (...args: A) => V;
  <A extends unknown[], V, E>(
    safeFn: (...args: A) => Promise<Result<V, E>>,
  ): (...args: A) => Promise<V>;
};

/**
 * Convert a "safe" function (one that always returns Result<V, E>)
 * into a "throwable" function (one that returns V or throws E).
 *
 * This matches the default JavaScript error-handling style, where
 * functions throw on failure instead of returning error values.
 *
 * Inside the library we always work with safe functions (Result<V, E>)
 * because they provide explicit, type-safe error handling and
 * predictable control flow.
 *
 * `asThrowable` is only used to expose a convenient, JS-idiomatic API
 * at the boundaries (i.e. public methods), while keeping the internal
 * implementation fully safe.
 */
export const asThrowable: AsThrowable = (safeFn: any) => {
  return (...args: unknown[]) => {
    const result = safeFn(...args);

    if (result instanceof Promise) {
      return result.then((res) => {
        if (res.ok) return res.value;
        throw res.error;
      });
    }

    if (result.ok) return result.value;
    throw result.error;
  };
};
