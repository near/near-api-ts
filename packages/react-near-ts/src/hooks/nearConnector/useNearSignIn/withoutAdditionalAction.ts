import type { EventMap } from '@hot-labs/near-connect/build/types';
import { useMutation } from '@tanstack/react-query';
import type { AccountId } from 'near-api-ts';
import type { InnerUseNearSignInArgs } from '../../../../types/hooks/nearConnector/useNearSignIn/useNearSignIn.ts';
import type { WithoutAdditionalActionOutput } from '../../../../types/hooks/nearConnector/useNearSignIn/withoutAdditionalAction.ts';
import type { SetConnectedAccountId, SetSigners, StoreContext } from '../../../../types/store.ts';
import { NearConnectorServiceSchema } from '../_common.ts';

export const withoutAdditionalAction = (
  context: StoreContext,
  setSigners: SetSigners,
  setConnectedAccountId: SetConnectedAccountId,
  args?: InnerUseNearSignInArgs,
): WithoutAdditionalActionOutput<unknown> => {
  const { mutate, mutateAsync, ...rest } = useMutation({
    ...args?.mutation,
    mutationFn: async () => {
      const services = NearConnectorServiceSchema.parse(context.services);
      const connector = services.nearConnector.serviceBox.connector;

      let callback!: (event: EventMap['wallet:signIn']) => void;

      try {
        const promise: Promise<AccountId> = new Promise((resolve) => {
          callback = (event) => {
            resolve(event.accounts[0]?.accountId);
          };
          connector.on('wallet:signIn', callback);
        });

        await connector.connect();
        const connectedAccountId = await promise;

        setSigners(connectedAccountId);
        setConnectedAccountId(connectedAccountId);
      } catch (e) {
        throw e;
      } finally {
        connector.off('wallet:signIn', callback);
      }
    },
  });

  return {
    ...rest,
    signIn: (args) => mutate(undefined, args?.mutate),
    signInAsync: (args) => mutateAsync(undefined, args?.mutate),
  };
};
