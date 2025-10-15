import { runOneRound } from './runOneRound';
import type {
  DefaultTransportContext,
  InnerRpcEndpoint,
  RequestPolicy,
  RpcTypePreferences,
} from 'nat-types/client/transport/defaultTransport';
import type { JsonLikeValue } from 'nat-types/common';
import { DefaultTransportError } from '../defaultTransportError';
import { sleep } from '@common/utils/common';

const getSortedRpcs = (
  rpcEndpoints: DefaultTransportContext['rpcEndpoints'],
  rpcTypePriority: RpcTypePreferences,
) => {
  const sortedList = rpcTypePriority.reduce((acc: InnerRpcEndpoint[], type) => {
    const value = rpcEndpoints[type] ?? [];
    acc.push(...value);
    return acc;
  }, []);

  if (sortedList.length === 0)
    return {
      error: new DefaultTransportError({
        code: 'NoAvailableRpc',
        message:
          `Invalid request configuration: no RPC endpoints found for any of the preferred types ` +
          `(${rpcTypePriority.join(', ')}).`,
      }),
    };

  return { value: sortedList };
};

export const runRounds = async (
  rpcEndpoints: DefaultTransportContext['rpcEndpoints'],
  requestPolicy: RequestPolicy,
  method: string,
  params: JsonLikeValue,
) => {
  const rpcs = getSortedRpcs(rpcEndpoints, requestPolicy.rpcTypePreferences);
  if (rpcs.error) return rpcs;

  for (let i = 0; i < requestPolicy.maxRounds; i++) {
    const result = await runOneRound(rpcs.value, requestPolicy, method, params);

    // If success
    if (result.value) return result;
    // If it's the last round
    if (i === requestPolicy.maxRounds - 1) return result;

    await sleep(requestPolicy.nextRpcDelayMs);
  }

  return {
    error: new DefaultTransportError({
      code: 'Unreachable',
      message: `Unreachable error in 'runRounds'.`,
    }),
  };
};
