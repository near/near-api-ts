import type { Result } from '@universal/types/_common/common';
import type { InnerRpcEndpoint, RpcTypePreferences, TransportContext } from '@universal/types/client/transport/transport';
import { createNatError, type NatError } from '../../../../../_common/natError';
import { result } from '../../../../../_common/utils/result';

export const getAvailableRpcs = (
  rpcEndpoints: TransportContext['rpcEndpoints'],
  rpcTypePreferences: RpcTypePreferences,
): Result<
  InnerRpcEndpoint[],
  NatError<'SendRequest.PreferredRpc.NotFound'>
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
          kind: 'SendRequest.PreferredRpc.NotFound',
          context: {
            rpcEndpoints,
            rpcTypePreferences,
          },
        }),
      );
};
