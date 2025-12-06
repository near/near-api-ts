import type { Milliseconds } from 'nat-types/_common/common';
import { createNatError } from '@common/natError';

export const createAttemptTimeout = (attemptTimeoutMs: Milliseconds) => {
  const controller = new AbortController();

  const timeoutId = setTimeout(
    () =>
      controller.abort(
        createNatError({
          kind: 'Client.Transport.SendRequest.Request.Attempt.Timeout',
          context: { allowedMs: attemptTimeoutMs },
        }),
      ),
    attemptTimeoutMs,
  );

  return {
    signal: controller.signal,
    timeoutId,
  };
};
