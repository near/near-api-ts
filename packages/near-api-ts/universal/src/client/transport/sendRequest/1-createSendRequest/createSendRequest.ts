import type { SendRequest, SendRequestContext } from '@universal/types/client/transport/sendRequest';
import type { TransportContext } from '@universal/types/client/transport/transport';
import { createNatError, isNatErrorOf } from '../../../../_common/natError';
import { result } from '../../../../_common/utils/result';
import { mergeTransportPolicy } from '../../transportPolicy';
import { tryMultipleRounds } from '../2-tryMultipleRounds/tryMultipleRounds';
import { getAvailableRpcs } from './_common/getAvailableRpcs';
import { createExternalAbortSignal } from './createExternalAbortSignal';
import { createRequestTimeout } from './createRequestTimeout';
import { handleMaybeUnknownBlock } from './handleMaybeUnknownBlock';

export const createSendRequest =
  (transportContext: TransportContext): SendRequest =>
  async (args) => {
    const transportPolicy = mergeTransportPolicy(
      transportContext.transportPolicy,
      args.transportPolicy,
    );

    // 1. Get rpc list based on the policy rpc preferences;
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

    // 2. Try to execute the request with fallback and retries;
    let requestResult = await tryMultipleRounds(context, rpcs.value);

    // 3. Try to use archival rpc if it's a Block.NotFound/GarbageCollected error;
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
        'SendRequest.PreferredRpc.NotFound',
        'SendRequest.Timeout',
        'SendRequest.Aborted',
      ])
    )
      // We repack the error cuz TS compiler can't figure out the type
      return result.err(requestResult.error);

    // if it's an attempt error - pack it into Exhausted error;
    if (
      isNatErrorOf(requestResult.error, [
        'SendRequest.Attempt.Request.FetchFailed',
        'SendRequest.Attempt.Request.Timeout',
        'SendRequest.Attempt.Response.JsonParseFailed',
        'SendRequest.Attempt.Response.InvalidSchema',
      ])
    )
      return result.err(
        createNatError({
          kind: 'SendRequest.Exhausted',
          context: { lastError: requestResult.error },
        }),
      );

    // Don't return high-level rpc errors - we will extract them in every client method again.
    // This will help us to avoid binding transport and client methods and should
    // simplify further integrations of a new client transport.
    //
    // For example, some transport may don't need to retry at all - and it will be
    // useless to force its author to implement partial rpc error handling;
    //
    // Instead return the original rpc response;
    return result.ok(requestResult.error.context.rawRpcResponse);
  };
