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
      NatError<'SendRequest.Aborted'> | NatError<'SendRequest.Timeout'>
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
