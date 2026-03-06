import { useMutation } from '@tanstack/react-query';
import type { TransactionIntent } from 'near-api-ts';
import { useNearStore } from '../store/NearStoreProvider.tsx';
import type { Signer } from '../../types/services/_common.ts';

type ExecuteTxArgs = {
  intent: TransactionIntent;
};

const execute = async (intent: TransactionIntent, signers: Signer[]) => {
  if (signers.length === 0) {
    throw new Error('No signers found'); // TODO throw rntError
  }

  for (let i = 0; i < signers.length; i++) {
    const signer = signers[i];
    if (!signer) continue;

    const result = await signer.safeExecuteTransaction({ intent });
    if (result.ok) return result.value;
    throw result.error;
  }

  throw new Error('No usable signer found');
};

export function useExecuteTransaction() {
  const getContext = useNearStore((s) => s.getContext);
  const context = getContext();

  return useMutation({
    mutationFn: ({ intent }: ExecuteTxArgs) => execute(intent, context.signers),
  });
}
