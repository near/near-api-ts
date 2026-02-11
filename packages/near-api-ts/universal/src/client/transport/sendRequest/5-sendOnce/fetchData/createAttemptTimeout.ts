import type { Milliseconds } from '../../../../../../types/_common/common';
import { createNatError } from '../../../../../_common/natError';

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
