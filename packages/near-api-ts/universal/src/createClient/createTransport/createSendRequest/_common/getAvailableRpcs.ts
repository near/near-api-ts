import type { Result } from '../../../../../types/_common/common';
import type {
  InnerRpcEndpoint,
  RpcTypePreferences,
  TransportContext,
} from '../../../../../types/client/transport/transport';
import type { NatError } from '../../../../_common/_common/_common/_common/natError';
import { result, resultNatError } from '../../../../_common/_common/_common/result';

export const getAvailableRpcs = (
  rpcEndpoints: TransportContext['rpcEndpoints'],
  rpcTypePreferences: RpcTypePreferences,
): Result<InnerRpcEndpoint[], NatError<'SendRequest.PreferredRpc.NotFound'>> => {
  const sortedList = rpcTypePreferences.reduce((acc: InnerRpcEndpoint[], type) => {
    const normalizedType = type === 'Regular' ? 'regular' : 'archival';
    const value = rpcEndpoints[normalizedType] ?? [];
    acc.push(...value);
    return acc;
  }, []);

  return sortedList.length > 0
    ? result.ok(sortedList)
    : resultNatError('SendRequest.PreferredRpc.NotFound', {
        rpcEndpoints,
        rpcTypePreferences,
      });
};
