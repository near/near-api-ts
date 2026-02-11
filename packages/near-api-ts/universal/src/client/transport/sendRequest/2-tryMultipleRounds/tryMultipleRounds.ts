import { tryOneRound } from '../3-tryOneRound/tryOneRound';
import { safeSleep } from '../../../../_common/utils/sleep';
import { combineAbortSignals } from '../../../../_common/utils/common';
import type { InnerRpcEndpoint } from '../../../../../types/client/transport/transport';
import type { SendRequestContext } from '../../../../../types/client/transport/sendRequest';
import type { SendOnceResult } from '../5-sendOnce/sendOnce';
import { type NatError, isNatErrorOf } from '../../../../_common/natError';

const shouldTryAnotherRound = (sendOnceResult: SendOnceResult): boolean =>
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

export const tryMultipleRounds = async (
  context: SendRequestContext,
  rpcs: InnerRpcEndpoint[],
): Promise<SendOnceResult> => {
  const { maxRounds, nextRoundDelayMs } = context.transportPolicy.failover;

  const round = async (roundIndex: number): Promise<SendOnceResult> => {
    const tryOneRoundResult = await tryOneRound(context, rpcs);
    const isLastRound = roundIndex >= maxRounds - 1;

    if (isLastRound || !shouldTryAnotherRound(tryOneRoundResult))
      return tryOneRoundResult;

    const sleepResult = await safeSleep<
      | NatError<'Client.Transport.SendRequest.Request.Aborted'>
      | NatError<'Client.Transport.SendRequest.Request.Timeout'>
    >(
      nextRoundDelayMs,
      combineAbortSignals([
        context.externalAbortSignal,
        context.requestTimeoutSignal,
      ]),
    );

    return sleepResult.ok ? round(roundIndex + 1) : sleepResult;
  };

  return round(0);
};
