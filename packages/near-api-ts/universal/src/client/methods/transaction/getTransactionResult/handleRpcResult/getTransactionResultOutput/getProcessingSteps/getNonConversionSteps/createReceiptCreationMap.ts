import type { CryptoHash } from '../../../../../../../../../types/_common/common';
import type { ConversionStepSuccess } from '../../../../../../../../../types/_common/transactionDetails/processingSteps/conversionStep';
import type { RpcFinalTransactionDetails } from '../../../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionDetails';

export type ReceiptCreationMap = Record<
  CryptoHash,
  { receiptId: CryptoHash; createdAtBlockHash: CryptoHash }
>;

export const createReceiptCreationMap = (
  conversionStep: ConversionStepSuccess,
  receiptsOutcome: RpcFinalTransactionDetails['receiptsOutcome'],
): ReceiptCreationMap => {
  const firstReceiptId = conversionStep.result.receiptId;

  return receiptsOutcome.reduce(
    (acc, receiptOutcome) => {
      receiptOutcome.outcome.receiptIds.forEach((createdReceiptId) => {
        acc[createdReceiptId.cryptoHash] = {
          receiptId: createdReceiptId.cryptoHash,
          createdAtBlockHash: receiptOutcome.blockHash.cryptoHash,
        };
      });
      return acc;
    },
    {
      [firstReceiptId]: {
        receiptId: firstReceiptId,
        createdAtBlockHash: conversionStep.executedAt.blockHash,
      },
    },
  );
};
