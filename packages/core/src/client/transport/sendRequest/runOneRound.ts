import { fetchWithRetry } from './fetchWithRetry';
import { sleep } from '@common/utils/common';
import type {
  InnerRpcEndpoint,
  RequestPolicy,
} from 'nat-types/client/transport/defaultTransport';
import type { JsonLikeValue } from 'nat-types/common';
import { DefaultTransportError } from '../defaultTransportError';

export const runOneRound = async (
  rpcs: InnerRpcEndpoint[],
  requestPolicy: RequestPolicy,
  method: string,
  params: JsonLikeValue,
) => {
  for (let i = 0; i < rpcs.length; i++) {
    const result = await fetchWithRetry(rpcs[i], requestPolicy, method, params);
    console.log('res in runOneRound', result.error?.code, rpcs[i].url);

    // If it's last rpc in the list
    if (i === rpcs.length - 1) return result;
    if (result.value) return result;

    await sleep(requestPolicy.nextRpcDelayMs);
  }

  return {
    error: new DefaultTransportError({
      code: 'Unreachable',
      message: `Unreachable error in 'runOneRound'.`,
    }),
  };
};
