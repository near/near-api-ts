import { hasTransportErrorCode } from '../../../transportError';
import { TransportError } from '../../../transportError';
import type {
  InnerRpcEndpoint,
  TransportPolicy,
} from 'nat-types/client/transport';
import type { JsonLikeValue } from 'nat-types/common';
import { createAttemptTimeout } from './createAttemptTimeout';
import { combineAbortSignals } from '@common/utils/common';

type FetchData = (args: {
  rpc: InnerRpcEndpoint;
  transportPolicy: TransportPolicy;
  body: JsonLikeValue;
  requestTimeoutSignal: AbortSignal;
  externalAbortSignal?: AbortSignal;
}) => Promise<
  { value: Response; error?: never } | { value?: never; error: TransportError }
>;

export const fetchData: FetchData = async ({
  rpc,
  transportPolicy,
  body,
  requestTimeoutSignal,
  externalAbortSignal,
}) => {
  const attemptTimeout = createAttemptTimeout(
    transportPolicy.timeouts.attemptMs,
  );

  try {
    const value = await fetch(rpc.url, {
      method: 'POST',
      headers: rpc.headers,
      body: JSON.stringify(body),
      signal: combineAbortSignals([
        externalAbortSignal,
        requestTimeoutSignal,
        attemptTimeout.signal,
      ]),
    });

    return { value };
  } catch (e) {
    if (
      hasTransportErrorCode(e, [
        'ExternalAbort',
        'RequestTimeout',
        'AttemptTimeout',
      ])
    )
      return { error: e as TransportError };

    return {
      error: new TransportError({
        code: 'Fetch',
        message:
          `Fetch failed: unable to send the request to '${rpc.url}' ` +
          '(connection refused, DNS error or network issues).',
        cause: e,
      }),
    };
  } finally {
    clearTimeout(attemptTimeout.timeoutId);
  }
};
