import { useNearStore } from '../store/NearStoreProvider.tsx';

export const useConnectedAccount = () => {
  const connectedAccountId = useNearStore((store) => store.connectedAccountId);
  return {
    connectedAccountId,
    isConnectedAccount: typeof connectedAccountId === 'string',
  };
};
