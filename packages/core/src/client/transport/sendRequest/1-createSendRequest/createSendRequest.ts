import { mergeTransportPolicy } from '../../transportPolicy';
import type { TransportContext } from 'nat-types/client/transport';
import type { SendRequest } from 'nat-types/client/client';
import { tryMultipleRounds } from '../2-tryMultipleRounds/tryMultipleRounds';
import { hasTransportErrorCode } from '../../transportError';
import { createExternalAbortSignal } from './createExternalAbortSignal';
import { createRequestTimeout } from './createRequestTimeout';
import { getAvailableRpcs } from './getAvailableRpcs';

export const createSendRequest =
  (context: TransportContext): SendRequest =>
  async (args) => {
    const transportPolicy = mergeTransportPolicy(
      context.transportPolicy,
      args.transportPolicy,
    );

    const rpcs = getAvailableRpcs(
      context.rpcEndpoints,
      transportPolicy.rpcTypePreferences,
    );
    if (rpcs.error) throw rpcs.error;

    const externalAbortSignal = createExternalAbortSignal(args.signal);

    const requestTimeout = createRequestTimeout(
      transportPolicy.timeouts.requestMs,
    );

    const result = await tryMultipleRounds({
      rpcs: rpcs.result,
      transportPolicy,
      method: args.method,
      params: args.params,
      externalAbortSignal,
      requestTimeoutSignal: requestTimeout.signal,
    });

    clearTimeout(requestTimeout.timeoutId);

    // Return the original abort reason
    if (hasTransportErrorCode(result.error, ['ExternalAbort']))
      throw result?.error?.cause;

    if (result.error) throw result.error;

    return result.result;
  };
