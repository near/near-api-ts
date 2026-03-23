import type {
  InnerUseNearConnectArgs
} from '../../../../types/hooks/nearConnector/useNearConnect/useNearConnect.ts';
import type { StoreContext, SetSigners, SetConnectedAccountId } from '../../../../types/store.ts';
import { useMutation } from '@tanstack/react-query';
import { NearConnectorServiceSchema } from '../_common.ts';
import type {
  WithoutAdditionalActionOutput
} from '../../../../types/hooks/nearConnector/useNearConnect/withoutAdditionalAction.ts';

export const withoutAdditionalAction = (
  args: InnerUseNearConnectArgs,
  context: StoreContext,
  setSigners: SetSigners,
  setConnectedAccountId: SetConnectedAccountId,
): WithoutAdditionalActionOutput<unknown> => {
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
    connect: (args) => mutate(undefined, args?.mutate),
    connectAsync: (args) => mutateAsync(undefined, args?.mutate),
  };
};
