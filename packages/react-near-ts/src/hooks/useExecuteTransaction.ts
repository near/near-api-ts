import { useMutation } from '@tanstack/react-query';
import { useNearStore } from '../store/NearStoreProvider.tsx';
import type { StoreContext } from '../../types/store.ts';
import type { UseExecuteTransaction } from '../../types/hooks/useExecuteTransaction.ts';
import type { TransactionIntent } from 'near-api-ts';

const tryOnManySigners = async (intent: TransactionIntent, context: StoreContext) => {
  const signers = context.signers;
  if (signers.length === 0) throw new Error('No signers available');

  const executeTransaction = async (signerIndex: number) => {
    const signer = signers[signerIndex];

    const result = await signer.safeExecuteTransaction({ intent });
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
    mutationFn: (variables) => tryOnManySigners(variables.intent, context),
  });

  return {
    ...rest,
    executeTransaction: (args) => mutate(args, args?.mutate),
    executeTransactionAsync: (args) => mutateAsync(args, args?.mutate),
  };
};
