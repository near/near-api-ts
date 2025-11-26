import type { Milliseconds } from 'nat-types/_common/common';
import { TransportError } from '../../../transportError';
import { oneLine } from '@common/utils/common';

export const createAttemptTimeout = (
  attemptTimeoutMs: Milliseconds,
) => {
  const controller = new AbortController();

  const timeoutId = setTimeout(
    () =>
      controller.abort(
        new TransportError({
          code: 'AttemptTimeout',
          message: oneLine(`The request attempt exceeded the configured timeout 
          and was aborted.`),
        }),
      ),
    attemptTimeoutMs,
  );

  return {
    signal: controller.signal,
    timeoutId,
  };
};
