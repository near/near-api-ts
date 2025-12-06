import { sendOnce, type SendOnceResult } from '../5-sendOnce/sendOnce';
import { safeSleep } from '@common/utils/sleep';
import { combineAbortSignals, randomBetween } from '@common/utils/common';
import type { InnerRpcEndpoint } from 'nat-types/client/transport/transport';
import type { SendRequestContext } from 'nat-types/client/transport/sendRequest';
import { isNatErrorOf, NatError } from '@common/natError';

// Decorrelated Jitter - https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
const getBackoffDelay = (
  cap: number,
  base: number,
  sleep: number,
  multiplier: number,
) => Math.min(cap, Math.round(randomBetween(base, sleep * multiplier)));

const shouldRetry = (sendOnceResult: SendOnceResult): boolean =>
  !sendOnceResult.ok &&
  isNatErrorOf(sendOnceResult.error, [
    'Client.Transport.SendRequest.Request.FetchFailed',
    'Client.Transport.SendRequest.Request.Attempt.Timeout',
    'Client.Transport.SendRequest.Rpc.Transaction.Timeout',
    'Client.Transport.SendRequest.Rpc.NotSynced',
    'Client.Transport.SendRequest.Rpc.Internal',
  ]);

export const sendWithRetry = async (
  context: SendRequestContext,
  rpc: InnerRpcEndpoint,
): Promise<SendOnceResult> => {
  const { maxAttempts, retryBackoff } = context.transportPolicy.rpc;

  let backoffDelay = retryBackoff.minDelayMs;

  const attempt = async (attemptIndex: number): Promise<SendOnceResult> => {
    const sendOnceResult = await sendOnce(context, rpc);

    const isLastAttempt = attemptIndex >= maxAttempts - 1;
    if (isLastAttempt || !shouldRetry(sendOnceResult)) return sendOnceResult;

    backoffDelay = getBackoffDelay(
      retryBackoff.maxDelayMs,
      retryBackoff.minDelayMs,
      backoffDelay,
      retryBackoff.multiplier,
    );

    const sleepResult = await safeSleep<
      | NatError<'Client.Transport.SendRequest.Request.Aborted'>
      | NatError<'Client.Transport.SendRequest.Request.Timeout'>
    >(
      backoffDelay,
      combineAbortSignals([
        context.externalAbortSignal,
        context.requestTimeoutSignal,
      ]),
    );

    return sleepResult.ok ? attempt(attemptIndex + 1) : sleepResult;
  };

  return attempt(0);
};
