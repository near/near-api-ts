import { sendOnce } from '../5-sendOnce/sendOnce';
import { safeSleep } from '@common/utils/sleep';
import { hasRpcErrorCode, RpcError } from '../../../rpcError';
import { TransportError, hasTransportErrorCode } from '../../transportError';
import { combineAbortSignals, randomBetween } from '@common/utils/common';
import type { Result } from 'nat-types/common';
import type {
  InnerRpcEndpoint,
  SendRequestContext,
} from 'nat-types/client/transport';

// Decorrelated Jitter - https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
const getBackoffDelay = (
  cap: number,
  base: number,
  sleep: number,
  multiplier: number,
) => Math.min(cap, Math.round(randomBetween(base, sleep * multiplier)));

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
  const { maxAttempts, retryBackoff } = context.transportPolicy.rpc;

  let backoffDelay = retryBackoff.minDelayMs;

  const attempt = async (attemptIndex: number) => {
    const result = await sendOnce(context, rpc, roundIndex, attemptIndex);

    const isLastAttempt = attemptIndex >= maxAttempts - 1;
    if (isLastAttempt || !shouldRetry(result)) return result;

    backoffDelay = getBackoffDelay(
      retryBackoff.maxDelayMs,
      retryBackoff.minDelayMs,
      backoffDelay,
      retryBackoff.multiplier,
    );

    const abortError = await safeSleep<TransportError>(
      backoffDelay,
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
