import { sendWithRetry } from '../4-sendWithRetry/sendWithRetry';
import { safeSleep } from '@common/utils/sleep';
import type {
  InnerRpcEndpoint,
  TransportPolicy,
} from 'nat-types/client/transport';
import type { JsonLikeValue } from 'nat-types/common';
import { TransportError, hasTransportErrorCode } from '../../transportError';
import { hasRpcErrorCode } from '../../../rpcError';
import { combineAbortSignals } from '@common/utils/common';

export const tryOneRound = async (args: {
  rpcs: InnerRpcEndpoint[];
  transportPolicy: TransportPolicy;
  method: string;
  params: JsonLikeValue;
  externalAbortSignal?: AbortSignal;
}) => {
  // Try to complete the request on all available rpcs once
  for (let i = 0; i < args.rpcs.length; i++) {
    // TODO filter only available with no inactiveUntil
    const result = await sendWithRetry({ ...args, rpc: args.rpcs[i] });
    console.log('res in runOneRound', result.error?.code, args.rpcs[i].url);

    // If it's the last RPC in the list
    if (i === args.rpcs.length - 1) return result;

    // When it makes sense to try the same request on the different RPC during this round
    if (
      hasTransportErrorCode(result.error, [
        'Fetch',
        'AttemptTimeout',
        'ParseResponseJson',
        'InvalidResponseSchema',
      ]) ||
      hasRpcErrorCode(result.error, [
        'ParseRequest',
        'MethodNotFound',
        'UnknownValidationError',
        'RpcTransactionTimeout',
      ])
    ) {
      // If user aborted the request or request time out while delay - stop the loop
      const error = await safeSleep<TransportError>(
        args.transportPolicy.failover.nextRpcDelayMs,
        combineAbortSignals([args.externalAbortSignal]),
      );
      if (error) return { error };

      continue;
    }

    // In all other cases - return result (successful of failed)
    return result;
  }

  return {
    error: new TransportError({
      code: 'Unreachable',
      message: `Unreachable error in 'runOneRound'.`,
    }),
  };
};
