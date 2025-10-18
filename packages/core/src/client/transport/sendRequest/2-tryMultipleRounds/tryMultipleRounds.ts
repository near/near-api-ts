import { tryOneRound } from '../3-tryOneRound/tryOneRound';
import type {
  TransportContext,
  InnerRpcEndpoint,
  TransportPolicy,
  RpcTypePreferences,
} from 'nat-types/client/transport';
import type { JsonLikeValue } from 'nat-types/common';
import { TransportError, hasTransportErrorCode } from '../../transportError';
import { safeSleep } from '@common/utils/sleep';
import { hasRpcErrorCode } from '../../../rpcError';
import { combineAbortSignals } from '@common/utils/common';

const getSortedRpcs = (
  rpcEndpoints: TransportContext['rpcEndpoints'],
  rpcTypePriority: RpcTypePreferences,
) => {
  const sortedList = rpcTypePriority.reduce((acc: InnerRpcEndpoint[], type) => {
    const normalizedType = type === 'Regular' ? 'regular' : 'archival';
    const value = rpcEndpoints[normalizedType] ?? [];
    acc.push(...value);
    return acc;
  }, []);

  if (sortedList.length === 0)
    return {
      error: new TransportError({
        code: 'NoAvailableRpc',
        message:
          `Invalid request configuration: no RPC endpoints found for any of the preferred types ` +
          `(${rpcTypePriority.join(', ')}).`,
      }),
    };

  return { value: sortedList };
};

export const tryMultipleRounds = async (args: {
  rpcEndpoints: TransportContext['rpcEndpoints'];
  transportPolicy: TransportPolicy;
  method: string;
  params: JsonLikeValue;
  externalAbortSignal?: AbortSignal;
}) => {
  const rpcs = getSortedRpcs(
    args.rpcEndpoints,
    args.transportPolicy.rpcTypePreferences,
  );
  if (rpcs.error) return rpcs;

  const { maxRounds, nextRoundDelayMs } = args.transportPolicy.failover;

  for (let i = 0; i < maxRounds; i++) {
    const result = await tryOneRound({ ...args, rpcs: rpcs.value });

    // If it's the last round
    if (i === maxRounds - 1) return result;

    // When it makes sense to run another round with the same request
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
        nextRoundDelayMs,
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
      message: `Unreachable error in 'runRounds'.`,
    }),
  };
};
