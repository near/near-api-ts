import { Dispatch, SetStateAction } from 'react';
import { functionCall, useSignDelegation } from 'react-near-ts';
import { ContractAccountId } from '@/app/contract-records/config.ts';

export const useSignAddRecordDelegation = (setRecordInput: Dispatch<SetStateAction<string>>) => {
  const mutation = useSignDelegation({ mutation: { onSettled: () => setRecordInput('') } });

  return {
    signAddRecordDelegation: (record: string) => {
      mutation.signDelegation({
        intent: {
          action: functionCall({
            functionName: 'add_record',
            functionArgs: { record },
            gasLimit: { teraGas: '10' },
          }),
          receiverAccountId: ContractAccountId,
          expiration: { blockOffset: 100 },
        },
      });
    },
    signAddRecordDelegationMutation: mutation,
  };
};
