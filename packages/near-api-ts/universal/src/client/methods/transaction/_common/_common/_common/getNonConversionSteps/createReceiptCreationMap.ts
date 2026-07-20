import type { BlockHash, ReceiptId } from '../../../../../../../../types/_common/common';
import type { ConversionStepSuccess } from '../../../../../../../../types/_common/transactionDetails/processingSteps/conversionStep';
import type { ReceiptsWithOutcomes } from './getReceiptsWithOutcomes';

export type ReceiptCreationMap = Record<
  ReceiptId,
  {
    kind: 'Execution' | 'Refund';
    createdAt: { blockHash: BlockHash };
  }
>;

/**
 * Here we create a map of receipt creation details for non-conversion steps;
 * We calculate it ourselves as RPC doesn't provide such data;
 * The first execution step can be created only by a conversion step, but all other non-conversion
 * steps may be created only by other execution steps;
 *
 * IMPORTANT: use it ONLY for ExecutedOptimistic/ExecutedNearlyFinal/ConvertedFinal processing stage;
 *
 * May contain not all refund receipts, but all execution receipts should be present and completed -
 * we use this assumption to determine the step kind;
 */
export const createReceiptCreationMap = (
  conversionStep: ConversionStepSuccess,
  receiptsWithOutcomes: ReceiptsWithOutcomes,
): ReceiptCreationMap => {
  // May contains not all refund receipts
  const stepTypeMap = receiptsWithOutcomes.reduce<Record<ReceiptId, 'Execution' | 'Refund'>>(
    (acc, item) => {
      acc[item.receipt.receiptId] =
        item.receipt.predecessorId === 'system' ? ('Refund' as const) : ('Execution' as const);
      return acc;
    },
    {},
  );

  return receiptsWithOutcomes.reduce<ReceiptCreationMap>(
    (acc, { receiptOutcome }) => {
      // Iterate over all created receipts by this step and mark them as created by this step
      receiptOutcome.outcome.receiptIds.forEach((createdReceiptId) => {
        acc[createdReceiptId.cryptoHash] = {
          // If we can't find the type of the receipt, we assume it's a refund receipt
          kind: stepTypeMap[createdReceiptId.cryptoHash] ?? 'Refund',
          createdAt: { blockHash: receiptOutcome.blockHash.cryptoHash },
        };
      });
      return acc;
    },
    {
      [conversionStep.result.firstExecutionStepId]: {
        kind: 'Execution',
        createdAt: { blockHash: conversionStep.executedAt.blockHash },
      },
    },
  );
};
