import { fetchWithRetry } from './fetchWithRetry';
import { sleep } from '@common/utils/common';
import type {
  InnerRpcEndpoint,
  RequestPolicy,
} from 'nat-types/client/transport/defaultTransport';
import type { JsonLikeValue } from 'nat-types/common';
import {
  DefaultTransportError,
  hasTransportErrorCode,
} from '../defaultTransportError';
import { hasRpcErrorCode } from '../../rpcError';

export const runOneRound = async (
  rpcs: InnerRpcEndpoint[],
  requestPolicy: RequestPolicy,
  method: string,
  params: JsonLikeValue,
) => {
  for (let i = 0; i < rpcs.length; i++) {
    // TODO filter only available with no inactiveUntil
    const result = await fetchWithRetry(rpcs[i], requestPolicy, method, params);
    console.log('res in runOneRound', result.error?.code, rpcs[i].url);

    // If it's the last RPC in the list
    if (i === rpcs.length - 1) return result;

    // When it makes sense to try the same request on the different RPC during this round
    if (
      hasTransportErrorCode(result.error, [
        //'Fetch',
        'AttemptTimeout',
        'ParseResponseJson',
        'InvalidResponseSchema',
      ]) ||
      hasRpcErrorCode(result.error, [
        'ParseRequest',
        'MethodNotFound',
        'UnknownValidationError',
        'RpcTransactionTimeout',
      ])
    ) {
      await sleep(requestPolicy.nextRpcDelayMs);
      continue;
    }
    // In all other cases - return result (successful of failed)
    return result;
  }

  return {
    error: new DefaultTransportError({
      code: 'Unreachable',
      message: `Unreachable error in 'runOneRound'.`,
    }),
  };
};
/*
 (DefaultTransportError.is(result.error) &&
        ['Fetch1', 'ParseResponseJson', 'InvalidResponseSchema'].includes(
          (result.error as DefaultTransportError).code,
        ))
 */
