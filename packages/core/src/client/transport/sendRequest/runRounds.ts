import { runOneRound } from './runOneRound';
import type {
  TransportContext,
  InnerRpcEndpoint,
  TransportPolicy,
  RpcTypePreferences,
} from 'nat-types/client/transport';
import type { JsonLikeValue } from 'nat-types/common';
import { TransportError, hasTransportErrorCode } from '../transportError';
import { sleep } from '@common/utils/common';
import { hasRpcErrorCode } from '../../rpcError';

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

export const runRounds = async (
  rpcEndpoints: TransportContext['rpcEndpoints'],
  transportPolicy: TransportPolicy,
  method: string,
  params: JsonLikeValue,
) => {
  const rpcs = getSortedRpcs(rpcEndpoints, transportPolicy.rpcTypePreferences);
  if (rpcs.error) return rpcs;

  const { maxRounds, nextRoundDelayMs } = transportPolicy.failover;

  for (let i = 0; i < maxRounds; i++) {
    const result = await runOneRound(
      rpcs.value,
      transportPolicy,
      method,
      params,
    );

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
      await sleep(nextRoundDelayMs);
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
