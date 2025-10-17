import { fetchWithRetry } from './fetchWithRetry';
import { sleep } from '@common/utils/common';
import type {
  InnerRpcEndpoint,
  TransportPolicy,
} from 'nat-types/client/transport';
import type { JsonLikeValue } from 'nat-types/common';
import { TransportError, hasTransportErrorCode } from '../transportError';
import { hasRpcErrorCode } from '../../rpcError';

export const runOneRound = async (
  rpcs: InnerRpcEndpoint[],
  transportPolicy: TransportPolicy,
  method: string,
  params: JsonLikeValue,
) => {
  for (let i = 0; i < rpcs.length; i++) {
    // TODO filter only available with no inactiveUntil
    const result = await fetchWithRetry(
      rpcs[i],
      transportPolicy,
      method,
      params,
    );
    console.log('res in runOneRound', result.error?.code, rpcs[i].url);

    // If it's the last RPC in the list
    if (i === rpcs.length - 1) return result;

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
      await sleep(transportPolicy.failover.nextRpcDelayMs);
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
