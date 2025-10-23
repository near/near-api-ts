import { mergeTransportPolicy } from '../../transportPolicy';
import type {
  SendRequestContext,
  TransportContext,
} from 'nat-types/client/transport';
import type { SendRequest } from 'nat-types/client/client';
import { tryMultipleRounds } from '../2-tryMultipleRounds/tryMultipleRounds';
import { hasTransportErrorCode } from '../../transportError';
import { createExternalAbortSignal } from './createExternalAbortSignal';
import { createRequestTimeout } from './createRequestTimeout';
import { getAvailableRpcs } from './_common/getAvailableRpcs';
import { handleMaybeUnknownBlock } from './handleMaybeUnknownBlock';
import { oneLine } from '@common/utils/common';

export const createSendRequest =
  (transportContext: TransportContext): SendRequest =>
  async (args) => {
    const transportPolicy = mergeTransportPolicy(
      transportContext.transportPolicy,
      args.transportPolicy,
    );

    // Get rpcs based on the rpc preferences policy
    const rpcs = getAvailableRpcs(
      transportContext.rpcEndpoints,
      transportPolicy.rpcTypePreferences,
    );
    if (rpcs.error) throw rpcs.error;

    const externalAbortSignal = createExternalAbortSignal(args.signal);

    const requestTimeout = createRequestTimeout(
      transportPolicy.timeouts.requestMs,
    );

    const context: SendRequestContext = {
      transportPolicy,
      method: args.method,
      params: args.params,
      externalAbortSignal,
      requestTimeoutSignal: requestTimeout.signal,
      errors: [],
    };

    // Try to execute the request with fallback;
    let result = await tryMultipleRounds(context, rpcs.result);

    // Try to use archival rpc if it's an UnknownBlock/GarbageCollectedBlock error
    result = await handleMaybeUnknownBlock({
      result,
      context,
      rpcEndpoints: transportContext.rpcEndpoints,
    });

    clearTimeout(requestTimeout.timeoutId);

    // TODO think how to integrate this into a logger
    if (context.errors.length > 0)
      console.error(
        'Errors during request: ',
        context.errors.map((err: any) =>
          oneLine(`R${err?.request?.roundIndex + 1}; 
            A${err?.request?.attemptIndex + 1}; 
            ${err.code}; 
            ${err?.request?.url};`),
        ),
      );

    // Return the original abort reason
    if (hasTransportErrorCode(result.error, ['ExternalAbort']))
      throw result?.error?.cause;

    if (result.error) {
      result.error.errors = context.errors;
      throw result.error;
    }

    return result.result;
  };
