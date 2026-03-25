import { functionCall, useExecuteTransaction } from 'react-near-ts';

export const useAddRecord = (setRecordInput: any) => {
  const addRecordMutation = useExecuteTransaction();

  return {
    addRecord: (record: string) => {
      addRecordMutation.mutate(
        {
          intent: {
            action: functionCall({
              functionName: 'add_record',
              functionArgs: { record },
              gasLimit: { teraGas: '10' },
            }),
            receiverAccountId: 'react-near-ts.lantstool.testnet',
          },
          query: {
            invalidateKeys: ['callContractReadFunction'],
          },
        },
        {
          onSuccess: () => setRecordInput(''),
        },
      );
    },
    addRecordMutation,
  };
};
