import { useQuery, skipToken } from '@tanstack/react-query';
import { useNearStore } from '../store/NearStoreProvider.tsx';
import type { UseAccountInfo } from '../../types/hooks/useAccountInfo.ts';

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
