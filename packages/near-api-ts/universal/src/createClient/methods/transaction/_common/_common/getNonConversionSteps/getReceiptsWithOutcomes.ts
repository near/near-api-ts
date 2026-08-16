import type { ConversionStepSuccess } from '../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/conversionStep';
import type { RpcActionReceipt } from '../../zodSchemas/rpcTransactionDetails/rpcActionReceipt';
import type { RpcReceiptOutcome } from '../../zodSchemas/rpcTransactionDetails/rpcReceiptOutcome';
import type { RpcTransactionSummary } from '../../zodSchemas/rpcTransactionDetails/rpcTransactionSummary';

type GetReceiptsWithOutcomesArgs = {
  transaction: RpcTransactionSummary;
  receipts: RpcActionReceipt[];
  receiptsOutcome: RpcReceiptOutcome[];
  conversionStepSuccess: ConversionStepSuccess;
};

export const getReceiptsWithOutcomes = (args: GetReceiptsWithOutcomesArgs) => {
  const { transaction, receipts, receiptsOutcome, conversionStepSuccess } = args;

  const hasLocalReceipt = transaction.signerId === transaction.receiverId;

  // For historical reasons when signerId = receiverId RPC doesn't return a first receipt but
  // return its outcome - so we need to recreate it from the transaction data;
  const fullReceipts = hasLocalReceipt
    ? [
        {
          receiptId: conversionStepSuccess.result.firstExecutionStepId,
          predecessorId: transaction.signerId,
          receiverId: transaction.receiverId,
          receipt: {
            Action: {
              actions: transaction.actions,
              inputDataIds: [],
              isPromiseYield: false,
              outputDataReceivers: [],
            },
          },
        },
        ...receipts,
      ]
    : receipts;

  return receiptsOutcome.map((receiptOutcome, index) => ({
    receipt: fullReceipts[index],
    receiptOutcome,
  }));
};

export type ReceiptsWithOutcomes = ReturnType<typeof getReceiptsWithOutcomes>;
