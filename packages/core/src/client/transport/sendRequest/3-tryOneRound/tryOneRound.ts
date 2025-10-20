import { sendWithRetry } from '../4-sendWithRetry/sendWithRetry';
import { safeSleep } from '@common/utils/sleep';
import type {
  InnerRpcEndpoint,
  TransportPolicy,
} from 'nat-types/client/transport';
import type { JsonLikeValue } from 'nat-types/common';
import { TransportError, hasTransportErrorCode } from '../../transportError';
import { hasRpcErrorCode, RpcError } from '../../../rpcError';
import { combineAbortSignals } from '@common/utils/common';

type TryOneRound = (args: {
  rpcs: InnerRpcEndpoint[];
  transportPolicy: TransportPolicy;
  method: string;
  params: JsonLikeValue;
  fallbackWhenUnknownBlock: boolean;
  requestTimeoutSignal: AbortSignal;
  externalAbortSignal?: AbortSignal;
}) => Promise<
  | { value: unknown; error?: never }
  | { value?: never; error: TransportError | RpcError }
>;

export const tryOneRound: TryOneRound = async (args) => {
  let result = {
    error: new TransportError({
      code: 'Unreachable',
      message: `Unreachable error in 'tryOneRound'.`,
    }),
  };
  let archivalOnly = false;

  // Try to complete the request on all available rpcs once
  for (let i = 0; i < args.rpcs.length; i++) {
    const rpc = args.rpcs[i];
    // Skip regular RPC if 'UnknownBlock' or 'GarbageCollectedBlock';
    // This rule applies only after 1 attempt;
    // console.log('rpc', archivalOnly, rpc);
    // console.log(args.rpcs);
    if (archivalOnly && rpc.type === 'regular') continue;

    result = await sendWithRetry({ ...args, rpc });
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
        'UnknownBlock',
        'GarbageCollectedBlock',
      ])
    ) {
      // If user aborted the request or request time out while delay - stop the loop
      const error = await safeSleep<TransportError>(
        args.transportPolicy.failover.nextRpcDelayMs,
        combineAbortSignals([
          args.externalAbortSignal,
          args.requestTimeoutSignal,
        ]),
      );
      if (error) return { error };

      if (
        hasRpcErrorCode(result.error, ['UnknownBlock', 'GarbageCollectedBlock'])
      ) {
        archivalOnly = true;
      }

      continue;
    }

    // In all other cases - return result (successful of failed)
    return result;
  }

  return result;
};
