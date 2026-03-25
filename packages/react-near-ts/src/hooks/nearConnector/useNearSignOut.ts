import { useMutation } from '@tanstack/react-query';
import type { UseNearSignOut } from '../../../types/hooks/nearConnector/useNearSignOut.ts';
import { useNearStore } from '../../store/NearStoreProvider.tsx';
import { NearConnectorServiceSchema } from './_common.ts';

export const useNearSignOut: UseNearSignOut = (args) => {
  const getContext = useNearStore((store) => store.getContext);
  const clearSigners = useNearStore((store) => store.clearSigners);
  const setConnectedAccountId = useNearStore((store) => store.setConnectedAccountId);
  const context = getContext();

  const { mutate, mutateAsync, ...rest } = useMutation({
    ...args?.mutation,
    mutationFn: async () => {
      const services = NearConnectorServiceSchema.parse(context.services);
      const connector = services.nearConnector.serviceBox.connector;

      await connector.disconnect();
      clearSigners();
      setConnectedAccountId(undefined);
    },
  });

  return {
    ...rest,
    signOut: (options) => mutate(undefined, options),
    signOutAsync: (options) => mutateAsync(undefined, options),
  };
};
