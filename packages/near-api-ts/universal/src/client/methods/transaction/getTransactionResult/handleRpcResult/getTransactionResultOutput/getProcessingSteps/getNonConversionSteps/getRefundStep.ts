import type {
  RefundStep,
  RefundStepResult,
} from '../../../../../../../../../types/_common/transactionDetails/processingSteps/refundStep';
import type { RpcActionReceiptTrimmed } from '../../../../../../../../_common/schemas/zod/rpc/transactionDetails/receipt';
import type { RpcReceiptOutcome } from '../../../../../../../../_common/schemas/zod/rpc/transactionDetails/receiptOutcome';
import type { ReceiptCreationMap } from './createReceiptCreationMap';

const getRefundStepResult = (status: RpcReceiptOutcome['outcome']['status']): RefundStepResult => {
  if (typeof status === 'object' && 'SuccessValue' in status) {
    return { status: 'Success' };
  }

  if (typeof status === 'object' && 'Failure' in status) {
    return {
      status: 'Error',
      error: {
        kind: 'any',
        context: status.Failure,
      },
    };
  }

  throw new Error(`Unexpected receipt execution outcome status: ${JSON.stringify(status)}`);
};

export const getRefundStep = (
  receipt: RpcActionReceiptTrimmed,
  receiptOutcome: RpcReceiptOutcome,
  receiptCreationMap: ReceiptCreationMap,
): RefundStep => {
  const { Action } = receipt.receipt;

  return {
    refundStepId: receipt.receiptId,
    result: getRefundStepResult(receiptOutcome.outcome.status),
    createdAt: receiptCreationMap.restSteps[receipt.receiptId].createdAt,
    createdBy: receiptCreationMap.restSteps[receipt.receiptId].createdBy,
    executedAt: { blockHash: receiptOutcome.blockHash.cryptoHash },
    executedBy: { accountId: receiptOutcome.outcome.executorId },
    actionSummaries: Action.actions,
  };
};
