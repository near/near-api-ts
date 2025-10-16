import { fetchOnce } from './fetchOnce';
import { sleep } from '@common/utils/common';
import { hasRpcErrorCode, RpcError } from '../../rpcError';
import type {
  InnerRpcEndpoint,
  RequestPolicy,
} from 'nat-types/client/transport/defaultTransport';
import type { JsonLikeValue } from 'nat-types/common';
import {
  DefaultTransportError,
  hasTransportErrorCode,
} from '../defaultTransportError';

export const fetchWithRetry = async (
  rpc: InnerRpcEndpoint,
  requestPolicy: RequestPolicy,
  method: string,
  params: JsonLikeValue,
): Promise<
  | { value: unknown; error?: never }
  | { value?: never; error: DefaultTransportError | RpcError }
> => {
  const { maxAttempts, backoff } = requestPolicy.rpcRetry;

  for (let i = 0; i < maxAttempts; i++) {
    const result = await fetchOnce(rpc, requestPolicy, method, params);
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
    error: new DefaultTransportError({
      code: 'Unreachable',
      message: `Unreachable error in 'fetchWithRetry'.`,
    }),
  };
};
