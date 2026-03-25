import type { EventMap } from '@hot-labs/near-connect/build/types';
import { useMutation } from '@tanstack/react-query';
import { type AccountId, nearToken } from 'near-api-ts';
import type { InnerUseNearSignInArgs } from '../../../../types/hooks/nearConnector/useNearSignIn/useNearSignIn.ts';
import type {
  Variables,
  WithAddFunctionCallKeyOutput,
} from '../../../../types/hooks/nearConnector/useNearSignIn/withAddFunctionCallKey.ts';
import type { SetConnectedAccountId, SetSigners, StoreContext } from '../../../../types/store.ts';
import { NearConnectorServiceSchema } from '../_common.ts';

export const withAddFunctionCallKey = (
  args: InnerUseNearSignInArgs,
  context: StoreContext,
  setSigners: SetSigners,
  setConnectedAccountId: SetConnectedAccountId,
): WithAddFunctionCallKeyOutput<unknown> => {
  const { mutate, mutateAsync, ...rest } = useMutation({
    ...args?.mutation,
    mutationFn: async (variables: Variables) => {
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

        const gasAllowance =
          variables.gasBudget === 'Unlimited'
            ? { kind: 'unlimited' as const }
            : {
                kind: 'limited' as const,
                amount: nearToken(variables.gasBudget).yoctoNear.toString(),
              };

        const allowMethods =
          variables.allowedFunctions === 'AllNonPayable'
            ? { anyMethod: true as const }
            : {
                anyMethod: false as const,
                methodNames: variables.allowedFunctions,
              };

        await connector.connect({
          addFunctionCallKey: {
            publicKey: variables.publicKey,
            contractId: variables.contractAccountId,
            gasAllowance,
            allowMethods,
          },
        });

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
    signIn: (args) => mutate(args, args?.mutate),
    signInAsync: (args) => mutateAsync(args, args?.mutate),
  };
};
