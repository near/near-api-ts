import type { Milliseconds } from 'nat-types/_common/common';
import { createNatError } from '@common/natError';

export const createRequestTimeout = (requestTimeoutMs: Milliseconds) => {
  const controller = new AbortController();

  const timeoutId = setTimeout(
    () =>
      controller.abort(
        createNatError({
          kind: 'Client.Transport.SendRequest.Request.Timeout',
          context: { allowedMs: requestTimeoutMs },
        }),
      ),
    requestTimeoutMs,
  );

  return {
    signal: controller.signal,
    timeoutId,
  };
};
