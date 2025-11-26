import type { Milliseconds } from 'nat-types/_common/common';
import { TransportError } from '../../transportError';
import { oneLine } from '@common/utils/common';

export const createRequestTimeout = (requestTimeoutMs: Milliseconds) => {
  const controller = new AbortController();

  const timeoutId = setTimeout(
    () =>
      controller.abort(
        new TransportError({
          code: 'RequestTimeout',
          message: oneLine(`The request exceeded the configured timeout 
          and was aborted.`),
        }),
      ),
    requestTimeoutMs,
  );

  return {
    signal: controller.signal,
    timeoutId,
  };
};
