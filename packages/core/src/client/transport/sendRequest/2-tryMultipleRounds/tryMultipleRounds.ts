import { tryOneRound } from '../3-tryOneRound/tryOneRound';
import { TransportError, hasTransportErrorCode } from '../../transportError';
import { safeSleep } from '@common/utils/sleep';
import { hasRpcErrorCode, RpcError } from '../../../rpcError';
import { combineAbortSignals } from '@common/utils/common';
import type {
  InnerRpcEndpoint,
  TransportPolicy,
} from 'nat-types/client/transport';
import type { JsonLikeValue, Result } from 'nat-types/common';

type TryMultipleRounds = (args: {
  rpcs: InnerRpcEndpoint[];
  transportPolicy: TransportPolicy;
  method: string;
  params: JsonLikeValue;
  requestTimeoutSignal: AbortSignal;
  externalAbortSignal?: AbortSignal;
}) => Promise<Result<unknown, TransportError | RpcError>>;

export const tryMultipleRounds: TryMultipleRounds = async (args) => {
  const { maxRounds, nextRoundDelayMs } = args.transportPolicy.failover;

  const round = async (
    roundIndex: number,
  ): Promise<Result<unknown, TransportError | RpcError>> => {
    const result = await tryOneRound(args);

    const isLastRound = roundIndex >= maxRounds;
    if (isLastRound) return result;

    // When it makes sense to run another round through all rpcs with the same request
    // For example - ParseRequest error - we validate all input data, and mostly it will be
    // a problem on the rpc side (rpc expects wrong format).
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
      // If user aborted the request or request time out while delay - stop
      const error = await safeSleep<TransportError>(
        nextRoundDelayMs,
        combineAbortSignals([
          args.externalAbortSignal,
          args.requestTimeoutSignal,
        ]),
      );
      if (error) return { error };

      return round(roundIndex + 1);
    }
    // In all other cases - return result (successful of failed)
    return result;
  };

  return round(1);
};
