import { Dispatch, SetStateAction } from 'react';
import { callContractFunction, useSignDelegation } from 'react-near-ts';
import { ContractAccountId } from '@/app/contract-records/config.ts';

export const useSignAddRecordDelegation = (setRecordInput: Dispatch<SetStateAction<string>>) => {
  const { signDelegation, ...mutation } = useSignDelegation({
    mutation: { onSettled: () => setRecordInput('') },
  });

  return {
    signAddRecordDelegation: (record: string) => {
      signDelegation({
        intent: {
          delegatedAction: callContractFunction({
            functionName: 'add_record',
            functionArgs: { record },
            gasLimit: { teraGas: '10' },
          }),
          receiverAccountId: ContractAccountId,
          expiration: { blockHeight: 100 },
        },
      });
    },
    ...mutation,
  };
};
