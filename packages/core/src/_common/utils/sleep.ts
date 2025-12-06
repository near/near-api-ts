import type { Result } from 'nat-types/_common/common';
import { result } from '@common/utils/result';

export const safeSleep = <E>(
  ms: number,
  signal?: AbortSignal,
): Promise<Result<true, E>> =>
  new Promise((resolve) => {
    const abort = () => resolve(result.err(signal?.reason));

    if (signal?.aborted) abort();
    const timeoutId = setTimeout(() => resolve(result.ok(true)), ms);

    if (signal)
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timeoutId);
          abort();
        },
        { once: true },
      );
  });
