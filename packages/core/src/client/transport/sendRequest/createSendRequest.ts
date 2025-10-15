import { mergeRequestPolicy } from '../requestPolicy';
import { createCircularQueue } from '@common/utils/createCircularQueue';
import { DefaultTransportError } from '../defaultTransportError';
import { fetchWithRetry } from './fetchWithRetry';
import { sleep } from '@common/utils/common';
import type {
  DefaultTransportContext,
  RpcTypePreferences,
  InnerRpcEndpoint,
} from 'nat-types/client/transport/defaultTransport';
import type { SendRequest } from 'nat-types/client/client';

const createRpcQueue = (
  context: DefaultTransportContext,
  rpcTypePriority: RpcTypePreferences,
) => {
  const sortedList = rpcTypePriority.reduce((acc: InnerRpcEndpoint[], type) => {
    const value = context.rpcEndpoints[type] ?? [];
    acc.push(...value);
    return acc;
  }, []);

  if (sortedList.length === 0)
    throw new DefaultTransportError({
      code: 'E1011',
      message:
        `Invalid request configuration: no RPC endpoints found for any of the preferred types ` +
        `(${rpcTypePriority.join(', ')}).`,
    });

  return createCircularQueue(sortedList);
};

export const createSendRequest =
  (context: DefaultTransportContext): SendRequest =>
  async ({ body }) => {
    // TODO: pass requestPolicy from the client method(f.e: from getTransaction)
    const requestPolicy = mergeRequestPolicy(context.requestPolicy);

    // TODO move to fetchOnce
    const bodyJson = JSON.stringify({
      jsonrpc: '2.0',
      id: 0,
      ...body,
    });

    const { nextRpcDelayMs, maxFullRounds } = context.requestPolicy;
    let rpcQueue = createRpcQueue(context, requestPolicy.rpcTypePreferences);

    const loopLimit = rpcQueue.size * maxFullRounds;

    for (let i = 0; i < loopLimit; i++) {
      const isLastAttempt = i === loopLimit - 1;

      try {
        const rpc = rpcQueue.next();
        console.log(rpc.url);

        const result = await fetchWithRetry(context, rpc, bodyJson);
        console.log('res in fetchFromMultipleRpcs', result);
        return result as any;
      } catch (e) {
        console.log('main loop error', i);
        if (isLastAttempt) throw e;
      } finally {
        await sleep(nextRpcDelayMs);
      }
    }
  };

