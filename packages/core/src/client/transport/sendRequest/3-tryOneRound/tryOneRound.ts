import { sendWithRetry } from '../4-sendWithRetry/sendWithRetry';
import { safeSleep } from '@common/utils/sleep';
import type {
  InnerRpcEndpoint,
  TransportPolicy,
} from 'nat-types/client/transport';
import type { JsonLikeValue, Result } from 'nat-types/common';
import { TransportError, hasTransportErrorCode } from '../../transportError';
import { hasRpcErrorCode, RpcError } from '../../../rpcError';
import { combineAbortSignals } from '@common/utils/common';

type TryOneRound = (args: {
  rpcs: InnerRpcEndpoint[];
  transportPolicy: TransportPolicy;
  method: string;
  params: JsonLikeValue;
  requestTimeoutSignal: AbortSignal;
  externalAbortSignal?: AbortSignal;
}) => Promise<Result<unknown, TransportError | RpcError>>;

export const tryOneRound: TryOneRound = async (args) => {
  const { nextRpcDelayMs } = args.transportPolicy.failover;

  const roundOnRpc = async (
    index: number,
    archivalOnly: boolean,
  ): Promise<Result<unknown, TransportError | RpcError>> => {
    const rpc = args.rpcs[index];

    // Skip non-archival RPCs if we've switched to archival-only mode
    if (archivalOnly && rpc.type !== 'archival')
      return roundOnRpc(index + 1, archivalOnly);

    const result = await sendWithRetry({ ...args, rpc });
    console.log('res in runOneRound', result.error?.code, rpc.url);

    const isLastRpc = index >= args.rpcs.length - 1;
    if (isLastRpc) return result;

    // Decide whether to continue to the next RPC within this round
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
      // Delay before trying the next RPC, but allow abort/timeouts to cancel the wait
      const error = await safeSleep<TransportError>(
        nextRpcDelayMs,
        combineAbortSignals([
          args.externalAbortSignal,
          args.requestTimeoutSignal,
        ]),
      );
      if (error) return { error };

      const nextArchivalOnly =
        archivalOnly ||
        hasRpcErrorCode(result.error, [
          'UnknownBlock',
          'GarbageCollectedBlock',
        ]);

      return roundOnRpc(index + 1, nextArchivalOnly);
    }

    // In all other cases return the current result (success or non-retryable error)
    return result;
  };

  return roundOnRpc(0, false);
};
