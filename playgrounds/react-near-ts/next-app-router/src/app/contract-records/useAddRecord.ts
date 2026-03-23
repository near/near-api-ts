import { functionCall, useExecuteTransaction } from 'react-near-ts';
import { ContractAccountId } from './config';
import { Dispatch, SetStateAction } from 'react';

export const useAddRecord = (setRecordInput: Dispatch<SetStateAction<string>>) => {
  const mutation = useExecuteTransaction();

  return {
    addRecord: (record: string) => {
      mutation.executeTransaction({
        intent: {
          action: functionCall({
            functionName: 'add_record',
            functionArgs: { record },
            gasLimit: { teraGas: '10' },
          }),
          receiverAccountId: ContractAccountId,
        },
        mutate: {
          onSuccess: (_data, _variables, _onMutateResult, context) => {
            setRecordInput('');
            context.client.invalidateQueries({
              queryKey: ['callContractReadFunction', ContractAccountId, 'get_records'],
            });
          },
        },
      });
    },
    addRecordMutation: mutation,
  };
};
