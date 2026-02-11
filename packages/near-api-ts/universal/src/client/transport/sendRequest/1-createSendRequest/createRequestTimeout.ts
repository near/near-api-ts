import type { Milliseconds } from '../../../../../types/_common/common';
import { createNatError } from '../../../../_common/natError';

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
