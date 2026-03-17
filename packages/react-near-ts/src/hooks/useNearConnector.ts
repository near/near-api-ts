import * as z from 'zod/mini';
import { NearConnector } from '@hot-labs/near-connect';
import { useNearStore } from '../store/NearStoreProvider.tsx';
import { useMutation } from '@tanstack/react-query';
import type { UseNearConnect } from '../../types/hooks/useNearConnect.ts';
import { randomEd25519KeyPair } from 'near-api-ts';

const NearConnectorServiceSchema = z.object({
  nearConnector: z.object({
    serviceBox: z.object({
      connector: z.instanceof(NearConnector),
    }),
  }),
});

// useNearConnector({ withWalletAction: 'SignMessage' })
// useNearConnector({ withWalletAction: 'AddFunctionCallKey' })

export const useNearConnector: UseNearConnect = () => {
  const getContext = useNearStore((store) => store.getContext);
  const setSigners = useNearStore((store) => store.setSigners);
  const clearSigners = useNearStore((store) => store.clearSigners);
  const setConnectedAccountId = useNearStore((store) => store.setConnectedAccountId);
  const context = getContext();

  const connect = useMutation<void, Error, void, unknown>({
    mutationFn: async () => {
      const services = NearConnectorServiceSchema.parse(context.services);
      const connector = services.nearConnector.serviceBox.connector;

      connector.once('wallet:signInAndSignMessage', (args) => {
        console.log('wallet:signInAndSignMessage', args);
      });

      connector.once('wallet:signIn', (args) => {
        console.log('wallet:signIn', args);
      });

      const wallet = await connector.connect({
        // signMessageParams: {
        //   message: "Connect to Near Wallet",
        //   recipient: 'abc',
        //   nonce: new Uint8Array(32).fill(0),
        // },
        // addFunctionCallKey: {
        //   contractId: 'testnet',
        //   publicKey: randomEd25519KeyPair().publicKey,
        //   allowMethods: { anyMethod: true },
        // },
      });

      const accounts = await wallet.getAccounts();
      const connectedAccountId = accounts[0].accountId;

      setSigners(connectedAccountId);
      setConnectedAccountId(connectedAccountId);
    },
  });

  const disconnect = useMutation<void, Error, void, unknown>({
    mutationFn: async () => {
      const services = NearConnectorServiceSchema.parse(context.services);
      const connector = services.nearConnector.serviceBox.connector;

      await connector.disconnect();
      clearSigners();
      setConnectedAccountId(undefined);
    },
  });

  return {
    connect,
    disconnect,
  };
};
