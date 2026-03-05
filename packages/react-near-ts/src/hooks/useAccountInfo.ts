import { useQuery, skipToken } from '@tanstack/react-query';
import {
  type GetAccountInfoOutput,
  type GetAccountInfoError,
  type AccountId,
} from 'near-api-ts';
import { useNearStore } from '../store/NearStoreProvider.tsx';

type UseAccountInfoArgs = {
  accountId?: AccountId;
};

export const useAccountInfo = ({ accountId }: UseAccountInfoArgs) => {
  const getContext = useNearStore((store) => store.getContext);
  const context = getContext();

  return useQuery<GetAccountInfoOutput, GetAccountInfoError>({
    queryKey: ['accountInfo', accountId],
    queryFn: accountId
      ? (args) =>
          context.client.getAccountInfo({
            accountId,
            options: { signal: args.signal },
          })
      : skipToken,
  });
};
