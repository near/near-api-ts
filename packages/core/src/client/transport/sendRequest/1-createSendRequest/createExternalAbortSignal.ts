import { TransportError } from '../../transportError';

/**
 * This function creates a proxy controller that intercepts a user-provided AbortSignal
 * and replaces it with an internally controlled one. A user can call abort()
 * with any custom reason, but for consistent internal handling, we need a predictable error type.
 *
 * We solve this by creating our own AbortController that:
 *  -	listens to the external signal’s abort event, and
 *  -	triggers its own abort() with a standardized error.
 *
 * Later, when processing the request result, we check this internal error and
 * return the original abort reason provided by the user.
 */
export const createExternalAbortSignal = (inputSignal?: AbortSignal) => {
  if (!inputSignal) return;

  const controller = new AbortController();

  inputSignal.addEventListener(
    'abort',
    () => {
      controller.abort(
        new TransportError({
          code: 'ExternalAbort',
          message: `The request was aborted by user.`,
          cause: inputSignal.reason,
        }),
      );
    },
    { once: true },
  );

  return controller.signal;
};
