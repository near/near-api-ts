import type {
  InnerRpcEndpoint,
  RpcTypePreferences,
  TransportContext,
} from 'nat-types/client/transport';
import { TransportError } from '../../../transportError';
import type { Result } from 'nat-types/common';

export const getAvailableRpcs = (
  rpcEndpoints: TransportContext['rpcEndpoints'],
  rpcTypePriority: RpcTypePreferences,
): Result<InnerRpcEndpoint[], TransportError> => {
  const sortedList = rpcTypePriority.reduce((acc: InnerRpcEndpoint[], type) => {
    const normalizedType = type === 'Regular' ? 'regular' : 'archival';
    const value = rpcEndpoints[normalizedType] ?? [];
    acc.push(...value);
    return acc;
  }, []);

  if (sortedList.length === 0)
    return {
      error: new TransportError({
        code: 'NoAvailableRpc',
        message:
          `Invalid request configuration: no RPC endpoints found for any of the preferred types ` +
          `(${rpcTypePriority.join(', ')}).`,
      }),
    };

  return { result: sortedList };
};
