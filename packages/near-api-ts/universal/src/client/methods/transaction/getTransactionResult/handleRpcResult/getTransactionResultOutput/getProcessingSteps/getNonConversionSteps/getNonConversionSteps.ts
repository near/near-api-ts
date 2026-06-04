import type { ConversionStepSuccess } from '../../../../../../../../../types/_common/transactionDetails/processingSteps/conversionStep';
import type { ExecutionSteps } from '../../../../../../../../../types/_common/transactionDetails/processingSteps/executionStep';
import type { RefundStep } from '../../../../../../../../../types/_common/transactionDetails/processingSteps/refundStep';
import type { RpcActionReceipt } from '../../../../../../../../_common/schemas/zod/rpc/transactionDetails/receipt';
import type { RpcReceiptOutcome } from '../../../../../../../../_common/schemas/zod/rpc/transactionDetails/receiptOutcome';
import type { RpcTransactionSummary } from '../../../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionSummary';
import { createReceiptCreationMap, type ReceiptCreationMap } from './createReceiptCreationMap';
import { getExecutionStep } from './getExecutionSteps/getExecutionStep';
import { getReceiptsWithOutcomes, type ReceiptsWithOutcomes } from './getReceiptsWithOutcomes';
import { getRefundStep } from './getRefundStep';

export const getExecutionSteps = (
  receiptsWithOutcomes: ReceiptsWithOutcomes,
  receiptCreationMap: ReceiptCreationMap,
): ExecutionSteps =>
  receiptsWithOutcomes
    .filter(({ receipt }) => receipt.predecessorId !== 'system')
    .map(({ receipt, receiptOutcome }) =>
      getExecutionStep(receipt, receiptOutcome, receiptCreationMap),
    );

const getRefundSteps = (
  receiptsWithOutcomes: ReceiptsWithOutcomes,
  receiptCreationMap: ReceiptCreationMap,
) =>
  receiptsWithOutcomes
    .filter(({ receipt }) => receipt.predecessorId === 'system')
    .map((receiptOutcome) =>
      getRefundStep(receiptOutcome.receipt, receiptOutcome.receiptOutcome, receiptCreationMap),
    );

type NonConversionSteps = { executionSteps: ExecutionSteps; refundSteps: RefundStep[] };

export const getNonConversionSteps = (
  transaction: RpcTransactionSummary,
  receipts: RpcActionReceipt[],
  receiptsOutcome: RpcReceiptOutcome[],
  conversionStepSuccess: ConversionStepSuccess,
): NonConversionSteps => {
  // To make sure we have at least one receipt outcome - theoretically it's possible that the
  // transaction just started and hasn't produced any receipts yet;
  if (receiptsOutcome.length === 0) return { executionSteps: [], refundSteps: [] };

  const receiptsWithOutcomes = getReceiptsWithOutcomes(
    transaction,
    receipts,
    receiptsOutcome,
    conversionStepSuccess,
  );

  const receiptCreationMap = createReceiptCreationMap(conversionStepSuccess, receiptsWithOutcomes);

  return {
    executionSteps: getExecutionSteps(receiptsWithOutcomes, receiptCreationMap),
    refundSteps: getRefundSteps(receiptsWithOutcomes, receiptCreationMap),
  };
};
