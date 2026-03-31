import { useMutation } from '@tanstack/react-query';
import type { UseSignDelegation } from '../../types/hooks/useSignDelegation.ts';
import type { SignDelegationArgs } from '../../types/services/_common.ts';
import type { StoreContext } from '../../types/store.ts';
import { useNearStore } from '../store/NearStoreProvider.tsx';

const tryOnManySigners = async (args: SignDelegationArgs, context: StoreContext) => {
  const signers = context.signers;
  if (signers.length === 0) throw new Error('No signers available');

  const signMessage = async (signerIndex: number) => {
    const signer = signers[signerIndex];

    const result = await signer.safeSignDelegation(args);
    if (result.ok) return result.value;

    throw result.error;
  };

  return signMessage(0);
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
