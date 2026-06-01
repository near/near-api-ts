import type {
  BlockHash,
  CryptoHash,
  ReceiptId,
  TransactionHash,
} from '../../../../../../../../../types/_common/common';
import type { ConversionStepSuccess } from '../../../../../../../../../types/_common/transactionDetails/processingSteps/conversionStep';
import type { ReceiptsWithOutcomes } from './getReceiptsWithOutcomes';

export type ReceiptCreationMap = {
  firstStep: {
    createdAt: { blockHash: BlockHash };
    createdBy: { conversionStepId: TransactionHash };
  };
  restSteps: Record<
    ReceiptId,
    {
      // @kind Makes sense only for 2-> n steps, as the first receipt can be created only by a conversion step
      // and will have always an 'Execution' type;
      kind: 'Execution' | 'Refund';
      createdAt: { blockHash: BlockHash };
      createdBy: { executionStepId: ReceiptId };
    }
  >;
};

/**
 * Here we create a map of receipt creation details for non-conversion steps;
 * We calculate it ourselves as RPC doesn't provide such data;
 * The first execution step can be created only by a conversion step, but all other non-conversion
 * steps may be created only by other execution steps;
 */
export const createReceiptCreationMap = (
  conversionStep: ConversionStepSuccess,
  receiptsWithOutcomes: ReceiptsWithOutcomes,
  transactionHash: CryptoHash,
): ReceiptCreationMap => {
  const firstStep = {
    createdBy: { conversionStepId: transactionHash },
    createdAt: { blockHash: conversionStep.executedAt.blockHash },
  };

  const stepTypeMap = receiptsWithOutcomes.reduce<Record<ReceiptId, 'Execution' | 'Refund'>>(
    (acc, item) => {
      acc[item.receipt.receiptId] =
        item.receipt.predecessorId === 'system' ? ('Refund' as const) : ('Execution' as const);
      return acc;
    },
    {},
  );

  const restSteps = receiptsWithOutcomes.reduce<ReceiptCreationMap['restSteps']>(
    (acc, { receiptOutcome }) => {
      receiptOutcome.outcome.receiptIds.forEach((createdReceiptId) => {
        acc[createdReceiptId.cryptoHash] = {
          kind: stepTypeMap[createdReceiptId.cryptoHash],
          createdAt: { blockHash: receiptOutcome.blockHash.cryptoHash },
          createdBy: { executionStepId: receiptOutcome.id.cryptoHash },
        };
      });
      return acc;
    },
    {},
  );

  return { firstStep, restSteps };
};
