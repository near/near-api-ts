import { createNatError } from '../../../_common/_common/_common/_common/natError';

/**
 * This function creates a proxy controller that intercepts a user-provided AbortSignal
 * and replaces it with an internally controlled one. A user can call abort()
 * with any custom reason, but for consistent internal handling, we need a predictable error type.
 *
 * We solve this by creating our own AbortController that:
 *  -	listens to the external signal’s abort event - or aborts right away when the signal
 *   	is already aborted, and
 *  -	triggers its own abort() with a standardized error.
 *
 * Later, when processing the request result, we check this internal error and
 * return the original abort reason provided by the user.
 */
export const createExternalAbortSignal = (inputSignal?: AbortSignal) => {
  if (!inputSignal) return;

  const controller = new AbortController();

  const abort = () =>
    controller.abort(
      createNatError({
        kind: 'SendRequest.Aborted',
        context: { reason: inputSignal.reason },
      }),
    );

  // A signal aborted before the request has no abort event left to fire
  if (inputSignal.aborted) abort();
  else inputSignal.addEventListener('abort', abort, { once: true });

  return controller.signal;
};
