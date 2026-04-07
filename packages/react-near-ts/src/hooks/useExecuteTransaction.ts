import { useMutation } from '@tanstack/react-query';
import type { UseExecuteTransaction } from '../../types/hooks/useExecuteTransaction.ts';
import type { ExecuteTransactionArgs } from '../../types/services/_common.ts';
import type { StoreContext } from '../../types/store.ts';
import { useNearStore } from '../store/NearStoreProvider.tsx';

const tryOnManySigners = async (args: ExecuteTransactionArgs, context: StoreContext) => {
  const signers = context.signers;

  const executeTransaction = async (signerIndex: number) => {
    const signer = signers[signerIndex];
    if (!signer) throw new Error('There is no signer that can execute transaction.');

    const canExecute = signer.canExecuteTransaction(args);
    if (!canExecute) return executeTransaction(signerIndex + 1);

    const result = await signer.safeExecuteTransaction(args);
    if (result.ok) return result.value;

    // TODO right now we only support one signer - we will support multiple signers after adding
    // canExecuteTransaction method to all signers
    throw result.error;
  };

  return executeTransaction(0);
};

export const useExecuteTransaction: UseExecuteTransaction = (args) => {
  const getContext = useNearStore((s) => s.getContext);
  const context = getContext();

  const { mutate, mutateAsync, ...rest } = useMutation({
    ...args?.mutation,
    mutationFn: (variables) => tryOnManySigners(variables, context),
  });

  return {
    ...rest,
    executeTransaction: (args) => mutate(args, args?.mutate),
    executeTransactionAsync: (args) => mutateAsync(args, args?.mutate),
  };
};
