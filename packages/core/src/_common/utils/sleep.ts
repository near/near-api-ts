export const sleep = (ms: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) reject(signal?.reason);
    const timeoutId = setTimeout(resolve, ms);

    if (signal)
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timeoutId);
          reject(signal?.reason);
        },
        { once: true },
      );
  });

// TODO unite sleep and safeSleep - add hasThrowError: true
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
