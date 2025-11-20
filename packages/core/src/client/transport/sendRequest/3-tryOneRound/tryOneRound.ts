import { sendWithRetry } from '../4-sendWithRetry/sendWithRetry';
import { safeSleep } from '@common/utils/sleep';
import { TransportError, hasTransportErrorCode } from '../../transportError';
import { hasRpcErrorCode, RpcError } from '../../../rpcError';
import { combineAbortSignals } from '@common/utils/common';
import { result } from '@common/utils/result';
import type {
  InnerRpcEndpoint,
  SendRequestContext,
} from 'nat-types/client/transport';
import type { Result } from 'nat-types/common';

const shouldTryAnotherRpc = (
  result: Result<unknown, TransportError | RpcError>,
): boolean =>
  !result.ok &&
  (hasTransportErrorCode(result.error, [
    'Fetch',
    'AttemptTimeout',
    'ParseResponseToJson',
    'InvalidResponseSchema',
  ]) ||
    hasRpcErrorCode(result.error, [
      'ParseRequest',
      'MethodNotFound',
      'UnknownValidationError',
      'RpcTransactionTimeout',
    ]));

export const tryOneRound = async (
  context: SendRequestContext,
  rpcs: InnerRpcEndpoint[],
  roundIndex: number,
): Promise<Result<unknown, TransportError | RpcError>> => {
  const { nextRpcDelayMs } = context.transportPolicy.failover;

  const roundOnRpc = async (rpcIndex: number) => {
    const rpc = rpcs[rpcIndex];

    const sendWithRetryResult = await sendWithRetry(context, rpc, roundIndex);
    const isLastRpc = rpcIndex >= rpcs.length - 1;

    if (isLastRpc || !shouldTryAnotherRpc(sendWithRetryResult))
      return sendWithRetryResult;

    const abortError = await safeSleep<TransportError>(
      nextRpcDelayMs,
      combineAbortSignals([
        context.externalAbortSignal,
        context.requestTimeoutSignal,
      ]),
    );

    if (abortError) {
      context.errors.push(abortError);
      return result.err(abortError);
    }

    return roundOnRpc(rpcIndex + 1);
  };

  return roundOnRpc(0);
};
