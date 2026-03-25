import { functionCall, useExecuteTransaction } from 'react-near-ts';
import { ContractAccountId } from './config';

export const useRemoveRecord = () => {
  const mutation = useExecuteTransaction();

  return {
    removeRecord: (index: number) => {
      mutation.executeTransaction({
        intent: {
          action: functionCall({
            functionName: 'remove_record',
            functionArgs: { index },
            gasLimit: { teraGas: '10' },
          }),
          receiverAccountId: ContractAccountId,
        },
        mutate: {
          onSuccess: (_data, _variables, _onMutateResult, context) => {
            void context.client.invalidateQueries({
              queryKey: ['callContractReadFunction', ContractAccountId, 'get_records'],
            });
          },
        },
      });
    },
    removeRecordMutation: mutation,
  };
};
