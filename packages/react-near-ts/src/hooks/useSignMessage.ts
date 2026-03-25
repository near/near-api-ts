import { useMutation } from '@tanstack/react-query';
import type { UseSignMessage } from '../../types/hooks/useSignMessage.ts';
import type { SignMessageArgs } from '../../types/services/_common.ts';
import type { StoreContext } from '../../types/store.ts';
import { useNearStore } from '../store/NearStoreProvider.tsx';

const tryOnManySigners = async (args: SignMessageArgs, context: StoreContext) => {
  const signers = context.signers;
  if (signers.length === 0) throw new Error('No signers available');

  const signMessage = async (signerIndex: number) => {
    const signer = signers[signerIndex];

    const result = await signer.safeSignMessage(args);
    if (result.ok) return result.value;

    // right now we only support one signer - we will support multiple signers after adding
    // canSignMessage method to all signers

    throw result.error;
  };

  return signMessage(0);
};

export const useSignMessage: UseSignMessage = (args) => {
  const getContext = useNearStore((s) => s.getContext);
  const context = getContext();

  const { mutate, mutateAsync, ...rest } = useMutation({
    ...args?.mutation,
    mutationFn: async (variables) => tryOnManySigners(variables, context),
  });

  return {
    ...rest,
    signMessage: (args) => mutate(args, args?.mutate),
    signMessageAsync: (args) => mutateAsync(args, args?.mutate),
  };
};
