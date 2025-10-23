import { sendOnce } from '../5-sendOnce/sendOnce';
import { safeSleep } from '@common/utils/sleep';
import { hasRpcErrorCode, RpcError } from '../../../rpcError';
import { TransportError, hasTransportErrorCode } from '../../transportError';
import { combineAbortSignals } from '@common/utils/common';
import type { Result } from 'nat-types/common';
import type {
  InnerRpcEndpoint,
  SendRequestContext,
} from 'nat-types/client/transport';

const shouldRetry = (
  result: Result<unknown, TransportError | RpcError>,
): boolean =>
  hasTransportErrorCode(result.error, ['AttemptTimeout']) ||
  hasRpcErrorCode(result.error, [
    'RpcTransactionTimeout',
    'NoSyncedBlocks',
    'UnknownRequestError',
    'InternalServerError',
  ]);

export const sendWithRetry = async (
  context: SendRequestContext,
  rpc: InnerRpcEndpoint,
  roundIndex: number,
): Promise<Result<unknown, TransportError | RpcError>> => {
  const { maxAttempts, backoff } = context.transportPolicy.retry;

  const attempt = async (attemptIndex: number) => {
    const result = await sendOnce(context, rpc, roundIndex, attemptIndex);

    const isLastAttempt = attemptIndex >= maxAttempts - 1;
    if (isLastAttempt || !shouldRetry(result)) return result;

    const abortError = await safeSleep<TransportError>(
      backoff.maxDelayMs, // TODO add real backoff
      combineAbortSignals([
        context.externalAbortSignal,
        context.requestTimeoutSignal,
      ]),
    );

    if (abortError) {
      context.errors.push(abortError);
      return { error: abortError };
    }

    return attempt(attemptIndex + 1);
  };

  return attempt(0);
};
