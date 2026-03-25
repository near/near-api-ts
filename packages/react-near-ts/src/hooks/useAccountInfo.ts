import { skipToken, useQuery } from '@tanstack/react-query';
import type { UseAccountInfo } from '../../types/hooks/useAccountInfo.ts';
import { useNearStore } from '../store/NearStoreProvider.tsx';

export const useAccountInfo: UseAccountInfo = (args) => {
  const getContext = useNearStore((store) => store.getContext);
  const context = getContext();

  const { accountId, query, ...rest } = args;

  return useQuery({
    queryKey: ['getAccountInfo', accountId],
    queryFn: accountId
      ? (args) =>
          context.client.getAccountInfo({
            ...rest,
            accountId,
            options: { signal: args.signal },
          })
      : skipToken,
    enabled: query?.enabled ?? true,
  });
};
