import type { InnerUseNearConnectArgs, NoAdditionalAction } from '../../../../types/hooks/nearConnector/useNearConnect.ts';
import type { StoreContext, SetSigners, SetConnectedAccountId } from '../../../../types/store.ts';
import { useMutation } from '@tanstack/react-query';
import { NearConnectorServiceSchema } from '../_common.ts';

export const useWithoutAdditionalAction = (
  args: InnerUseNearConnectArgs,
  context: StoreContext,
  setSigners: SetSigners,
  setConnectedAccountId: SetConnectedAccountId,
): NoAdditionalAction['output'] => {
  const { mutate, mutateAsync, ...rest } = useMutation({
    ...args?.mutation,
    mutationFn: async () => {
      const services = NearConnectorServiceSchema.parse(context.services);
      const connector = services.nearConnector.serviceBox.connector;

      const wallet = await connector.connect();
      const accounts = await wallet.getAccounts();
      const connectedAccountId = accounts[0].accountId;

      setSigners(connectedAccountId);
      setConnectedAccountId(connectedAccountId);
    },
  });

  return {
    ...rest,
    connect: (args) => mutate(undefined, args),
    connectAsync: (args) => mutateAsync(undefined, args),
  };
};
