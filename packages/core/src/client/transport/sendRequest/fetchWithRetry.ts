import { fetchOnce } from './fetchOnce';
import { sleep } from '@common/utils/common';
import { hasRpcErrorCode, RpcError } from '../../rpcError';
import type {
  InnerRpcEndpoint,
  TransportPolicy,
} from 'nat-types/client/transport';
import type { JsonLikeValue } from 'nat-types/common';
import { TransportError, hasTransportErrorCode } from '../transportError';

export const fetchWithRetry = async (
  rpc: InnerRpcEndpoint,
  transportPolicy: TransportPolicy,
  method: string,
  params: JsonLikeValue,
): Promise<
  | { value: unknown; error?: never }
  | { value?: never; error: TransportError | RpcError }
> => {
  const { maxAttempts, backoff } = transportPolicy.retry;

  for (let i = 0; i < maxAttempts; i++) {
    const result = await fetchOnce(rpc, transportPolicy, method, params);
    console.log('res in fetchWithRetry', result.error?.code, rpc.url);

    // If it's a last attempt - return any result
    if (i === maxAttempts - 1) return result;

    // If it makes sense to try again on the same rpc - try
    if (
      hasTransportErrorCode(result.error, ['AttemptTimeout']) ||
      hasRpcErrorCode(result.error, [
        'RpcTransactionTimeout',
        'NoSyncedBlocks',
        'UnknownRequestError',
        'InternalServerError',
      ])
    ) {
      await sleep(backoff.maxDelayMs);
      continue;
    }
    // In all other cases - return result (successful of failed)
    return result;
  }

  return {
    error: new TransportError({
      code: 'Unreachable',
      message: `Unreachable error in 'fetchWithRetry'.`,
    }),
  };
};
