import { mergeTransportPolicy } from '../../transportPolicy';
import type { TransportContext } from 'nat-types/client/transport';
import type { SendRequest } from 'nat-types/client/client';
import { tryMultipleRounds } from '../2-tryMultipleRounds/tryMultipleRounds';
import type { Milliseconds } from 'nat-types/common';
import { hasTransportErrorCode, TransportError } from '../../transportError';
import { oneLine } from '@common/utils/common';
import { createExternalAbortSignal } from './createExternalAbortSignal';

const createRequestTimeoutController = (
  requestTimeout: Milliseconds,
  signal?: AbortSignal,
) => {
  const controller = new AbortController();

  const requestTimeoutId = setTimeout(
    () =>
      controller.abort(
        new TransportError({
          code: 'RequestTimeout',
          message: oneLine(`The request exceeded the configured timeout 
          and was aborted.`),
        }),
      ),
    requestTimeout,
  );

  return {
    signal: controller.signal,
    requestTimeoutId,
  };
};

export const createSendRequest =
  (context: TransportContext): SendRequest =>
  async (args) => {
    const transportPolicy = mergeTransportPolicy(
      context.transportPolicy,
      args.transportPolicy,
    );

    const externalAbortSignal = createExternalAbortSignal(args.signal);

    // errorStack

    const result = await tryMultipleRounds({
      rpcEndpoints: context.rpcEndpoints,
      transportPolicy,
      method: args.method,
      params: args.params,
      externalAbortSignal,
    });

    if (hasTransportErrorCode(result.error, ['ExternalAbort']))
      throw result?.error?.cause; // test null error

    // clear interval for request timeout
    if (result.error) throw result.error;
    return result.value;
  };
