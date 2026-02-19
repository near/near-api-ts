import type { Milliseconds } from '@universal/types/_common/common';
import { createNatError } from '../../../../_common/natError';

export const createRequestTimeout = (requestTimeoutMs: Milliseconds) => {
  const controller = new AbortController();

  const timeoutId = setTimeout(
    () =>
      controller.abort(
        createNatError({
          kind: 'SendRequest.Timeout',
          context: { timeoutMs: requestTimeoutMs },
        }),
      ),
    requestTimeoutMs,
  );

  return {
    signal: controller.signal,
    timeoutId,
  };
};
