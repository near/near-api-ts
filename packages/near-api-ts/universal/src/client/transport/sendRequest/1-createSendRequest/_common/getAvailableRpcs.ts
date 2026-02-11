import type {
  InnerRpcEndpoint,
  RpcTypePreferences,
  TransportContext,
} from '../../../../../../types/client/transport/transport';
import { result } from '../../../../../_common/utils/result';
import type { Result } from '../../../../../../types/_common/common';
import { createNatError, type NatError } from '../../../../../_common/natError';

export const getAvailableRpcs = (
  rpcEndpoints: TransportContext['rpcEndpoints'],
  rpcTypePreferences: RpcTypePreferences,
): Result<
  InnerRpcEndpoint[],
  NatError<'Client.Transport.SendRequest.PreferredRpc.NotFound'>
> => {
  const sortedList = rpcTypePreferences.reduce(
    (acc: InnerRpcEndpoint[], type) => {
      const normalizedType = type === 'Regular' ? 'regular' : 'archival';
      const value = rpcEndpoints[normalizedType] ?? [];
      acc.push(...value);
      return acc;
    },
    [],
  );

  return sortedList.length > 0
    ? result.ok(sortedList)
    : result.err(
        createNatError({
          kind: 'Client.Transport.SendRequest.PreferredRpc.NotFound',
          context: {
            rpcEndpoints,
            rpcTypePreferences,
          },
        }),
      );
};
