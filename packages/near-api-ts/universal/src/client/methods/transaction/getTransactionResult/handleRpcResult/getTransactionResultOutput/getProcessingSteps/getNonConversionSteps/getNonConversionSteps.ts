import type { ConversionStepSuccess } from '../../../../../../../../../types/_common/transactionDetails/processingSteps/conversionStep';
import type { ExecutionStep } from '../../../../../../../../../types/_common/transactionDetails/processingSteps/executionStep';
import type { RefundStep } from '../../../../../../../../../types/_common/transactionDetails/processingSteps/refundStep';
import type { RpcActionReceipt } from '../../../../../../../../_common/schemas/zod/rpc/transactionDetails/receipt';
import type { RpcReceiptOutcome } from '../../../../../../../../_common/schemas/zod/rpc/transactionDetails/receiptOutcome';
import type { RpcTransactionSummary } from '../../../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionSummary';
import { createReceiptCreationMap } from './createReceiptCreationMap';
import { getExecutionStep } from './getExecutionSteps/getExecutionStep';
import { getRefundStep } from './getRefundStep';

const getReceiptsWithOutcomes = (
  transaction: RpcTransactionSummary,
  receipts: RpcActionReceipt[],
  receiptsOutcome: RpcReceiptOutcome[],
  conversionStepSuccess: ConversionStepSuccess,
) => {
  const hasLocalReceipt = transaction.signerId === transaction.receiverId;

  // For historical reasons when signerId = receiverId RPC doesn't return a first receipt, but
  // return its outcome - so we need to recreate it from the transaction data;
  const normalizedReceipts = hasLocalReceipt
    ? [
        {
          receiptId: conversionStepSuccess.result.receiptId,
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
    receipt: normalizedReceipts[index],
    receiptOutcome,
  }));
};

export const getNonConversionSteps = (
  transaction: RpcTransactionSummary,
  receipts: RpcActionReceipt[],
  receiptsOutcome: RpcReceiptOutcome[],
  conversionStepSuccess: ConversionStepSuccess,
): { executionSteps: ExecutionStep[]; refundSteps: RefundStep[] } => {
  // To make sure we have at least one receipt outcome - theoretically it's possible that the
  // transaction just started and hasn't produced any receipts yet;
  if (receiptsOutcome.length === 0) return { executionSteps: [], refundSteps: [] };

  const receiptCreationMap = createReceiptCreationMap(conversionStepSuccess, receiptsOutcome);

  const receiptsWithOutcomes = getReceiptsWithOutcomes(
    transaction,
    receipts,
    receiptsOutcome,
    conversionStepSuccess,
  );

  const executionSteps = receiptsWithOutcomes
    .filter(({ receipt }) => receipt.predecessorId !== 'system')
    .map((receiptOutcome) =>
      getExecutionStep(receiptOutcome.receipt, receiptOutcome.receiptOutcome, receiptCreationMap),
    );

  const refundSteps = receiptsWithOutcomes
    .filter(({ receipt }) => receipt.predecessorId === 'system')
    .map((receiptOutcome) =>
      getRefundStep(receiptOutcome.receipt, receiptOutcome.receiptOutcome, receiptCreationMap),
    );

  return {
    executionSteps,
    refundSteps,
  };
};
