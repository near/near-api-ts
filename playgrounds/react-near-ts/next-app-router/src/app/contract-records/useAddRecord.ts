import { functionCall, useExecuteTransaction } from 'react-near-ts';
import { ContractAccountId } from '@/app/contract-records/config';

export const useAddRecord = (setRecordInput: any) => {
  const executeTransaction = useExecuteTransaction();

  return {
    addRecord: (record: string) => {
      executeTransaction.mutate(
        {
          intent: {
            action: functionCall({
              functionName: 'add_record',
              functionArgs: { record },
              gasLimit: { teraGas: '10' },
            }),
            receiverAccountId: ContractAccountId,
          },
        },
        {
          onSuccess: (_data, _variables, _onMutateResult, context) => {
            setRecordInput('');
            context.client.invalidateQueries({
              queryKey: ['callContractReadFunction', ContractAccountId, 'get_records'],
            });
          },
        },
      );
    },
    addRecordMutation: executeTransaction,
  };
};
