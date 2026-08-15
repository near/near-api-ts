import type { SendRequestContext } from '../../../../types/client/transport/sendRequest';
import type { InnerRpcEndpoint } from '../../../../types/client/transport/transport';
import { isNatErrorOf, type NatError } from '../../../_common/_common/_common/_common/natError';
import { combineAbortSignals } from './_common/combineAbortSignals';
import { safeSleep } from './_common/sleep';
import type { SendOnceResult } from './sendOnce/sendOnce';
import { sendWithRetry } from './sendWithRetry';

const shouldTryAnotherRpc = (sendOnceResult: SendOnceResult): boolean =>
  !sendOnceResult.ok &&
  isNatErrorOf(sendOnceResult.error, [
    'SendRequest.Attempt.Request.FetchFailed',
    'SendRequest.Attempt.Request.Timeout',
    'SendRequest.Attempt.Response.JsonParseFailed',
    'SendRequest.Attempt.Response.InvalidSchema',
    'SendRequest.InnerRpc.MethodNotFound',
    'SendRequest.InnerRpc.ParseFailed',
    'SendRequest.InnerRpc.Transaction.Timeout',
    'SendRequest.InnerRpc.NotSynced',
    'SendRequest.InnerRpc.Internal',
  ]);

export const tryOneRound = async (
  context: SendRequestContext,
  rpcs: InnerRpcEndpoint[],
): Promise<SendOnceResult> => {
  const { nextRpcDelayMs } = context.transportPolicy.failover;

  const roundOnRpc = async (rpcIndex: number): Promise<SendOnceResult> => {
    const rpc = rpcs[rpcIndex];

    const sendWithRetryResult = await sendWithRetry(context, rpc);
    const isLastRpc = rpcIndex >= rpcs.length - 1;

    if (isLastRpc || !shouldTryAnotherRpc(sendWithRetryResult)) return sendWithRetryResult;

    const sleepResult = await safeSleep<
      NatError<'SendRequest.Aborted'> | NatError<'SendRequest.Timeout'>
    >(
      nextRpcDelayMs,
      combineAbortSignals([context.externalAbortSignal, context.requestTimeoutSignal]),
    );

    return sleepResult.ok ? roundOnRpc(rpcIndex + 1) : sleepResult;
  };

  return roundOnRpc(0);
};
