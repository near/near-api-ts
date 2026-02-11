import { sendWithRetry } from '../4-sendWithRetry/sendWithRetry';
import { safeSleep } from '../../../../_common/utils/sleep';
import { combineAbortSignals } from '../../../../_common/utils/common';
import type { InnerRpcEndpoint } from '../../../../../types/client/transport/transport';
import type { SendRequestContext } from '../../../../../types/client/transport/sendRequest';
import { isNatErrorOf, type NatError } from '../../../../_common/natError';
import type { SendOnceResult } from '../5-sendOnce/sendOnce';

const shouldTryAnotherRpc = (sendOnceResult: SendOnceResult): boolean =>
  !sendOnceResult.ok &&
  isNatErrorOf(sendOnceResult.error, [
    'Client.Transport.SendRequest.Request.FetchFailed',
    'Client.Transport.SendRequest.Request.Attempt.Timeout',
    'Client.Transport.SendRequest.Response.JsonParseFailed',
    'Client.Transport.SendRequest.Response.InvalidSchema',
    'Client.Transport.SendRequest.Rpc.MethodNotFound',
    'Client.Transport.SendRequest.Rpc.ParseFailed',
    'Client.Transport.SendRequest.Rpc.Transaction.Timeout',
    'Client.Transport.SendRequest.Rpc.NotSynced',
    'Client.Transport.SendRequest.Rpc.Internal',
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

    if (isLastRpc || !shouldTryAnotherRpc(sendWithRetryResult))
      return sendWithRetryResult;

    const sleepResult = await safeSleep<
      | NatError<'Client.Transport.SendRequest.Request.Aborted'>
      | NatError<'Client.Transport.SendRequest.Request.Timeout'>
    >(
      nextRpcDelayMs,
      combineAbortSignals([
        context.externalAbortSignal,
        context.requestTimeoutSignal,
      ]),
    );

    return sleepResult.ok ? roundOnRpc(rpcIndex + 1) : sleepResult;
  };

  return roundOnRpc(0);
};
