import { functionCall, useExecuteTransaction } from 'react-near-ts';

export const useRemoveRecord = () => {
  const removeRecordMutation = useExecuteTransaction();

  return {
    removeRecord: (index: number) => {
      removeRecordMutation.mutate({
        intent: {
          action: functionCall({
            functionName: 'remove_record',
            functionArgs: { index },
            gasLimit: { teraGas: '10' },
          }),
          receiverAccountId: 'react-near-ts.lantstool.testnet',
        },
        query: {
          invalidateKeys: ['callContractReadFunction'],
        },
      });
    },
    removeRecordMutation,
  };
};
