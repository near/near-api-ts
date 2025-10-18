import { sendOnce } from '../5-sendOnce/sendOnce';
import { safeSleep } from '@common/utils/sleep';
import { hasRpcErrorCode, RpcError } from '../../../rpcError';
import type {
  InnerRpcEndpoint,
  TransportPolicy,
} from 'nat-types/client/transport';
import type { JsonLikeValue } from 'nat-types/common';
import { TransportError, hasTransportErrorCode } from '../../transportError';
import { combineAbortSignals } from '@common/utils/common';

type SendWithRetry = (args: {
  rpc: InnerRpcEndpoint;
  transportPolicy: TransportPolicy;
  method: string;
  params: JsonLikeValue;
  externalAbortSignal?: AbortSignal;
}) => Promise<
  | { value: unknown; error?: never }
  | { value?: never; error: TransportError | RpcError }
>;

export const sendWithRetry: SendWithRetry = async (args) => {
  const { maxAttempts, backoff } = args.transportPolicy.retry;

  for (let i = 0; i < maxAttempts; i++) {
    const result = await sendOnce(args);
    console.log('sendWithRetry', result.error?.code, args.rpc.url);

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
      // If user aborted the request or request time out while delay - stop the loop
      const error = await safeSleep<TransportError>(
        backoff.maxDelayMs,
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
      message: `Unreachable error in 'fetchWithRetry'.`,
    }),
  };
};
