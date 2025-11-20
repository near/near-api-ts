import { hasTransportErrorCode } from '../../../transportError';
import { TransportError } from '../../../transportError';
import { createAttemptTimeout } from './createAttemptTimeout';
import { combineAbortSignals } from '@common/utils/common';
import type {
  InnerRpcEndpoint,
  SendRequestContext,
} from 'nat-types/client/transport';
import type { JsonLikeValue, Result } from 'nat-types/common';
import { result } from '@common/utils/result';

export const fetchData = async (
  context: SendRequestContext,
  rpc: InnerRpcEndpoint,
  body: JsonLikeValue,
): Promise<Result<Response, TransportError>> => {
  const attemptTimeout = createAttemptTimeout(
    context.transportPolicy.timeouts.attemptMs,
  );

  try {
    const response = await fetch(rpc.url, {
      method: 'POST',
      headers: rpc.headers,
      body: JSON.stringify(body),
      signal: combineAbortSignals([
        context.externalAbortSignal,
        context.requestTimeoutSignal,
        attemptTimeout.signal,
      ]),
    });

    return result.ok(response);
  } catch (e) {
    if (
      hasTransportErrorCode(e, [
        'ExternalAbort',
        'RequestTimeout',
        'AttemptTimeout',
      ])
    )
      return result.err(e as TransportError);

    return result.err(
      new TransportError({
        code: 'Fetch',
        message:
          `Fetch failed: unable to send the request to '${rpc.url}' ` +
          '(connection refused, DNS error or network issues).',
        cause: e,
      }),
    );
  } finally {
    clearTimeout(attemptTimeout.timeoutId);
  }
};
