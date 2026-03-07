import { functionCall, useExecuteTransaction } from 'react-near-ts';
import { ContractAccountId } from './config';

export const useRemoveRecord = () => {
  const removeRecordMutation = useExecuteTransaction();

  return {
    removeRecord: (index: number) => {
      removeRecordMutation.mutate(
        {
          intent: {
            action: functionCall({
              functionName: 'remove_record',
              functionArgs: { index },
              gasLimit: { teraGas: '10' },
            }),
            receiverAccountId: ContractAccountId,
          },
        },
        {
          onSuccess: (_data, _variables, _onMutateResult, context) => {
            context.client.invalidateQueries({
              queryKey: ['callContractReadFunction', ContractAccountId, 'get_records'],
            });
          },
        },
      );
    },
    removeRecordMutation,
  };
};
