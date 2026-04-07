import { useMutation } from '@tanstack/react-query';
import type { UseSignDelegation } from '../../types/hooks/useSignDelegation.ts';
import type { SignDelegationArgs } from '../../types/services/_common.ts';
import type { StoreContext } from '../../types/store.ts';
import { useNearStore } from '../store/NearStoreProvider.tsx';

const tryOnManySigners = async (args: SignDelegationArgs, context: StoreContext) => {
  const signers = context.signers;

  const signDelegation = async (signerIndex: number) => {
    const signer = signers[signerIndex];

    if (!signer)
      throw new Error(
        'There is no signer that can sign delegation. If you use nearConnect service make sure ' +
          'to enable supportedFeatures.signDelegation feature in createNearConnectorService',
      );

    const canSign = signer.canSignDelegation(args);
    if (!canSign) return signDelegation(signerIndex + 1);

    const result = await signer.safeSignDelegation(args);
    if (result.ok) return result.value;

    throw result.error;
  };

  return signDelegation(0);
};

export const useSignDelegation: UseSignDelegation = (args) => {
  const getContext = useNearStore((s) => s.getContext);
  const context = getContext();

  const { mutate, mutateAsync, ...rest } = useMutation({
    ...args?.mutation,
    mutationFn: async (variables) => tryOnManySigners(variables, context),
  });

  return {
    ...rest,
    signDelegation: (args) => mutate(args, args?.mutate),
    signDelegationAsync: (args) => mutateAsync(args, args?.mutate),
  };
};
