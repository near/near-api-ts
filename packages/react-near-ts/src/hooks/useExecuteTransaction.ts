import { useMutation } from '@tanstack/react-query';
import type { TransactionIntent } from 'near-api-ts';
import { useNearStore } from '../store/NearStoreProvider.tsx';
import type { Signer } from '../store/nearStore.ts';

type ExecuteTxArgs = {
  intent: TransactionIntent;
  query?: {
    invalidateKeys?: string[];
  };
};

async function executeWithFallback(
  intent: TransactionIntent,
  signers: Signer[],
) {
  if (signers.length === 0) {
    throw new Error('No signers found'); // TODO throw rntError
  }

  for (let i = 0; i < signers.length; i++) {
    const signer = signers[i];
    if (!signer) continue;

    const result = await signer.safeExecuteTransaction({ intent });
    console.log('result', result);
    if (result.ok) return result.value;

    // TODO implement in the future - check if a signer can sigh the tx - need to have a standard way
    // to do it
    // if (
    //   isNatError(
    //     result.error,
    //     'MemorySigner.ExecuteTransaction.KeyPool.SigningKey.NotFound',
    //   )
    // ) {
    //   continue;
    // }

    throw result.error;
  }

  throw new Error('No usable signer found');
}

export function useExecuteTransaction() {
  const connectedAccountId = useNearStore((s) => s.connectedAccountId);
  const getContext = useNearStore((s) => s.getContext);
  const context = getContext();

  return useMutation({
    mutationKey: ['executeTransaction', connectedAccountId],

    mutationFn: ({ intent }: ExecuteTxArgs) =>
      executeWithFallback(intent, context.signers),

    onSuccess: async (_, variables, ___, context) => {
      if (variables?.query?.invalidateKeys) {
        void context.client.invalidateQueries({
          queryKey: variables.query.invalidateKeys,
        });
      }
    },
  });
}
