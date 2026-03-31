import type { UseConnectedAccount } from '../../types/hooks/useConnectedAccount.ts';
import { useNearStore } from '../store/NearStoreProvider.tsx';

export const useConnectedAccount: UseConnectedAccount = () => {
  const connectedAccountId = useNearStore((store) => store.connectedAccountId);

  return typeof connectedAccountId === 'string'
    ? {
        connectedAccountId,
        isConnectedAccount: true,
      }
    : {
        isConnectedAccount: false,
      };
};
