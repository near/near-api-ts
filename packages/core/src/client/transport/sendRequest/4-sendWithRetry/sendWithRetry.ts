import { sendOnce } from '../5-sendOnce/sendOnce';
import { safeSleep } from '@common/utils/sleep';
import { hasRpcErrorCode, RpcError } from '../../../rpcError';
import { TransportError, hasTransportErrorCode } from '../../transportError';
import { combineAbortSignals } from '@common/utils/common';
import type { JsonLikeValue, Result } from 'nat-types/common';
import type {
  InnerRpcEndpoint,
  TransportPolicy,
} from 'nat-types/client/transport';

type SendWithRetry = (args: {
  rpc: InnerRpcEndpoint;
  transportPolicy: TransportPolicy;
  method: string;
  params: JsonLikeValue;
  requestTimeoutSignal: AbortSignal;
  externalAbortSignal?: AbortSignal;
}) => Promise<Result<unknown, TransportError | RpcError>>;

export const sendWithRetry: SendWithRetry = async (args) => {
  const { maxAttempts, backoff } = args.transportPolicy.retry;

  const attempt = async (
    attemptIndex: number,
  ): Promise<Result<unknown, TransportError | RpcError>> => {
    const result = await sendOnce(args);
    console.log('sendWithRetry', result.error?.code, args.rpc.url);

    const isLastAttempt = attemptIndex >= maxAttempts - 1;
    if (isLastAttempt) return result;

    if (
      hasTransportErrorCode(result.error, ['AttemptTimeout']) ||
      hasRpcErrorCode(result.error, [
        'RpcTransactionTimeout',
        'NoSyncedBlocks',
        'UnknownRequestError',
        'InternalServerError',
      ])
    ) {
      // Sleep before next attempt, but allow both external abort and request timeout to cancel the delay.
      const error = await safeSleep<TransportError>(
        backoff.maxDelayMs, // TODO add real backoff
        combineAbortSignals([
          args.externalAbortSignal,
          args.requestTimeoutSignal,
        ]),
      );
      if (error) return { error };

      return attempt(attemptIndex + 1);
    }
    // In all other cases return the current result (success or non-retryable error)
    return result;
  };

  return attempt(0);
};
