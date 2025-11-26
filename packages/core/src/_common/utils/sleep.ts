// TODO return Result
export const safeSleep = <E>(
  ms: number,
  signal?: AbortSignal,
): Promise<void | E> =>
  new Promise((resolve) => {
    const abort = () => resolve(signal?.reason);

    if (signal?.aborted) abort();
    const timeoutId = setTimeout(() => resolve(), ms);

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
