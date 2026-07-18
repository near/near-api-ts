import type { ConversionStepSuccess } from '../../../../../../../types/_common/transactionDetails/processingSteps/conversionStep';
import type { RpcActionReceipt } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/receipt';
import type { RpcReceiptOutcome } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/receiptOutcome';
import type { RpcTransactionSummary } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionSummary';

export const getReceiptsWithOutcomes = (
  transaction: RpcTransactionSummary,
  receipts: RpcActionReceipt[],
  receiptsOutcome: RpcReceiptOutcome[],
  conversionStepSuccess: ConversionStepSuccess,
) => {
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
