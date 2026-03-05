import * as z from 'zod/mini';
import { NearConnector } from '@hot-labs/near-connect';
import { useNearStore } from '../store/NearStoreProvider.tsx';

const NearConnectorServiceSchema = z.object({
  nearConnector: z.object({
    serviceBox: z.object({
      connector: z.instanceof(NearConnector),
    }),
  }),
});

export const useNearConnector = () => {
  const networkId = useNearStore((store) => store.networkId);
  const getContext = useNearStore((store) => store.getContext);
  const setSigners = useNearStore((store) => store.setSigners);
  const clearSigners = useNearStore((store) => store.clearSigners);
  const setConnectedAccountId = useNearStore(
    (store) => store.setConnectedAccountId,
  );
  const context = getContext();

  const connect = async () => {
    // TODO Return proper error
    const services = NearConnectorServiceSchema.parse(context.services);
    const connector = services.nearConnector.serviceBox.connector;

    try {
      const wallet = await connector.connect();
      const accounts = await wallet.getAccounts({ network: networkId as any }); // TODO validate networkId
      const connectedAccountId = accounts[0].accountId;

      setSigners(connectedAccountId);
      setConnectedAccountId(connectedAccountId);
    } catch (e) {
      console.log(e);
      return e;
    }
  };

  const disconnect = async () => {
    // TODO Return proper error
    const services = NearConnectorServiceSchema.parse(context.services);
    const connector = services.nearConnector.serviceBox.connector;

    try {
      await connector.disconnect();
      clearSigners();
      setConnectedAccountId(undefined);
    } catch (e) {
      console.log(e);
      return e;
    }
  };

  return {
    connect,
    disconnect,
  };
};
