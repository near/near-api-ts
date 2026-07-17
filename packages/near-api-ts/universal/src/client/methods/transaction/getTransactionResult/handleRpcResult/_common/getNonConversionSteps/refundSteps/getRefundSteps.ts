import { yoctoNear } from '../../../../../../../../../index';
import type {
  RefundStep,
  RefundStepResult,
} from '../../../../../../../../../types/_common/transactionDetails/processingSteps/refundStep';
import type { RpcActionReceiptTrimmed } from '../../../../../../../../_common/schemas/zod/rpc/transactionDetails/receipt';
import type { RpcReceiptOutcome } from '../../../../../../../../_common/schemas/zod/rpc/transactionDetails/receiptOutcome';
import type { ReceiptCreationMap } from '../createReceiptCreationMap';
import type { ReceiptsWithOutcomes } from '../getReceiptsWithOutcomes';

const getRefundStepResult = (status: RpcReceiptOutcome['outcome']['status']): RefundStepResult => {
  if (typeof status === 'object' && 'SuccessValue' in status && status.SuccessValue === '') {
    return { status: 'Success' };
  }

  if (
    typeof status === 'object' &&
    'Failure' in status &&
    typeof status.Failure.ActionError.kind === 'object' &&
    'AccountDoesNotExist' in status.Failure.ActionError.kind
  ) {
    return {
      status: 'Error',
      error: { kind: 'Receiver.NotFound', context: null },
    };
  }

  throw new Error(`Unexpected refund receipt outcome status: 
    got: ${JSON.stringify(status)}, 
    but only SuccessValue = '' or Failure.ActionError.kind = AccountDoesNotExist is expected.`);
};

const getRefundAmount = (receipt: RpcActionReceiptTrimmed) => {
  const { actions } = receipt.receipt.Action;

  if (actions.length === 1 && typeof actions[0] === 'object' && 'Transfer' in actions[0]) {
    return yoctoNear(actions[0].Transfer.deposit);
  }

  throw new Error(
    `Unexpected refund receipt actions: 
    got: ${JSON.stringify(receipt.receipt.Action.actions)}, 
    but only a single Transfer action is expected.`,
  );
};

const getRefundStep = (
  receipt: RpcActionReceiptTrimmed,
  receiptOutcome: RpcReceiptOutcome,
  receiptCreationMap: ReceiptCreationMap,
): RefundStep => {
  return {
    refundStepId: receipt.receiptId,
    result: getRefundStepResult(receiptOutcome.outcome.status),
    createdAt: receiptCreationMap[receipt.receiptId].createdAt,
    executedAt: { blockHash: receiptOutcome.blockHash.cryptoHash },
    refundAmount: getRefundAmount(receipt),
    receiverAccountId: receiptOutcome.outcome.executorId,
  };
};

export const getRefundSteps = (
  receiptsWithOutcomes: ReceiptsWithOutcomes,
  receiptCreationMap: ReceiptCreationMap,
) =>
  receiptsWithOutcomes
    .filter(({ receipt }) => receipt.predecessorId === 'system')
    .map((receiptOutcome) =>
      getRefundStep(receiptOutcome.receipt, receiptOutcome.receiptOutcome, receiptCreationMap),
    );
