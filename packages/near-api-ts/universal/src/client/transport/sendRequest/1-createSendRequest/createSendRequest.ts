import { mergeTransportPolicy } from '../../transportPolicy';
import type { TransportContext } from '../../../../../types/client/transport/transport';
import { tryMultipleRounds } from '../2-tryMultipleRounds/tryMultipleRounds';
import { createExternalAbortSignal } from './createExternalAbortSignal';
import { createRequestTimeout } from './createRequestTimeout';
import { getAvailableRpcs } from './_common/getAvailableRpcs';
import { handleMaybeUnknownBlock } from './handleMaybeUnknownBlock';
import type {
  SendRequest,
  SendRequestContext,
} from '../../../../../types/client/transport/sendRequest';
import { isNatErrorOf } from '../../../../_common/natError';
import { result } from '../../../../_common/utils/result';

export const createSendRequest =
  (transportContext: TransportContext): SendRequest =>
  async (args) => {
    const transportPolicy = mergeTransportPolicy(
      transportContext.transportPolicy,
      args.transportPolicy,
    );

    // Get rpc list based on the policy rpc preferences;
    const rpcs = getAvailableRpcs(
      transportContext.rpcEndpoints,
      transportPolicy.rpcTypePreferences,
    );
    if (!rpcs.ok) return rpcs;

    // We want to provide the ability to abort the request;
    const maybeExternalAbortSignal = createExternalAbortSignal(args.signal);

    // Start general timeout - how much time we can try to execute a request;
    const requestTimeout = createRequestTimeout(
      transportPolicy.timeouts.requestMs,
    );

    const context: SendRequestContext = {
      transportPolicy,
      method: args.method,
      params: args.params,
      externalAbortSignal: maybeExternalAbortSignal,
      requestTimeoutSignal: requestTimeout.signal,
    };

    // Try to execute the request with fallback;
    let requestResult = await tryMultipleRounds(context, rpcs.value);

    // Try to use archival rpc if it's Block.NotFound/GarbageCollected error;
    requestResult = await handleMaybeUnknownBlock({
      requestResult,
      context,
      rpcEndpoints: transportContext.rpcEndpoints,
    });

    clearTimeout(requestTimeout.timeoutId);

    // If all ok - return the raw RPC result;
    if (requestResult.ok) return requestResult;

    // Return only transport own errors as ResultErr;
    if (
      isNatErrorOf(requestResult.error, [
        'Client.Transport.SendRequest.PreferredRpc.NotFound',
        'Client.Transport.SendRequest.Request.FetchFailed',
        'Client.Transport.SendRequest.Request.Attempt.Timeout',
        'Client.Transport.SendRequest.Request.Timeout',
        'Client.Transport.SendRequest.Request.Aborted',
        'Client.Transport.SendRequest.Response.JsonParseFailed',
        'Client.Transport.SendRequest.Response.InvalidSchema',
      ])
    )
      // We repack error cuz TS compiler can't figure out the type
      return result.err(requestResult.error);

    // Don't return high-level rpc errors - we will extract them in every client method again.
    // This will help us to avoid binding transport and client methods and should
    // simplify further integrations of a new client transports.
    //
    // For example: some transport may don't need to retry at all - and it will be
    // useless to force its author to implement partial rpc error handling;
    //
    // Instead return the original rpc response;
    return result.ok(requestResult.error.context.rawRpcResponse);
  };
