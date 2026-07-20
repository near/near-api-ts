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
 */
export const createReceiptCreationMap = (
  conversionStep: ConversionStepSuccess,
  receiptsWithOutcomes: ReceiptsWithOutcomes,
): ReceiptCreationMap => {
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
          kind: stepTypeMap[createdReceiptId.cryptoHash],
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
