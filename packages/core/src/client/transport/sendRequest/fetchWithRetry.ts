import type {
  DefaultTransportContext,
  InnerRpcEndpoint,
} from 'nat-types/client/transport/defaultTransport';
import { fetchOnce } from './fetchOnce';
import { sleep } from '@common/utils/common';
import { RpcError } from '../../rpcError';

export const fetchWithRetry = async (
  context: DefaultTransportContext,
  rpc: InnerRpcEndpoint,
  bodyJson: any,
) => {
  const { maxAttempts, backoff } = context.requestPolicy.rpcRetry;

  for (let i = 0; i < maxAttempts; i++) {
    const isLastAttempt = i === maxAttempts - 1;
    try {
      const result = await fetchOnce(rpc, bodyJson);
      // console.log('fetchFromRpcWithRetry result', result);
      return result;
    } catch (e) {
      console.log('fetchWithRetryError', rpc.url, i);
      if (isLastAttempt) throw e;

      if (RpcError.is(e)) {
        if (['GarbageCollectedBlock'].includes((e as RpcError).code)) continue;
      }

      throw e;
    } finally {
      await sleep(backoff.maxDelayMs);
    }
  }
};
