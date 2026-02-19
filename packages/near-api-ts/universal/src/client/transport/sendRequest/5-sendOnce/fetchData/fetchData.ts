import { createAttemptTimeout } from './createAttemptTimeout';
import { combineAbortSignals } from '../../../../../_common/utils/common';
import type { InnerRpcEndpoint } from '../../../../../../types/client/transport/transport';
import type {
  JsonLikeValue,
  Result,
} from '../../../../../../types/_common/common';
import { result } from '../../../../../_common/utils/result';
import type { SendRequestContext } from '../../../../../../types/client/transport/sendRequest';
import {
  createNatError,
  isNatErrorOf,
  type NatError,
} from '../../../../../_common/natError';

export type FetchDataError =
  | NatError<'SendRequest.Attempt.Request.FetchFailed'>
  | NatError<'SendRequest.Attempt.Request.Timeout'>
  | NatError<'SendRequest.Timeout'>
  | NatError<'SendRequest.Aborted'>;

export const fetchData = async (
  context: SendRequestContext,
  rpc: InnerRpcEndpoint,
  body: JsonLikeValue,
): Promise<Result<Response, FetchDataError>> => {
  const attemptTimeout = createAttemptTimeout(
    context.transportPolicy.timeouts.attemptMs,
  );

  try {
    const response = await fetch(rpc.url, {
      method: 'POST',
      headers: rpc.headers,
      body: JSON.stringify(body),
      signal: combineAbortSignals([
        context.externalAbortSignal,
        context.requestTimeoutSignal,
        attemptTimeout.signal,
      ]),
    });

    return result.ok(response);
  } catch (e) {
    if (
      isNatErrorOf(e, [
        'SendRequest.Attempt.Request.Timeout',
        'SendRequest.Timeout',
        'SendRequest.Aborted',
      ])
    )
      return result.err(e);

    return result.err(
      createNatError({
        kind: 'SendRequest.Attempt.Request.FetchFailed',
        context: {
          cause: e,
          rpc,
          requestBody: body,
        },
      }),
    );
  } finally {
    clearTimeout(attemptTimeout.timeoutId);
  }
};
