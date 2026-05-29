import { gas, yoctoNear } from '../../../../../../../../../../index';
import type {
  ExecutionStep,
  ExecutionStepResult,
} from '../../../../../../../../../../types/_common/transactionDetails/processingSteps/executionStep';
import type { RpcActionReceiptTrimmed } from '../../../../../../../../../_common/schemas/zod/rpc/transactionDetails/receipt';
import type { RpcReceiptOutcome } from '../../../../../../../../../_common/schemas/zod/rpc/transactionDetails/receiptOutcome';
import type { ReceiptCreationMap } from '../createReceiptCreationMap';

const getExecutionStepOutcome = (
  status: RpcReceiptOutcome['outcome']['status'],
): ExecutionStepResult => {
  if (typeof status === 'object' && 'SuccessValue' in status) {
    return {
      status: 'Success',
      data: status.SuccessValue,
    };
  }

  if (typeof status === 'object' && 'SuccessReceiptId' in status) {
    return {
      status: 'ContinuesIn',
      receiptId: status.SuccessReceiptId.cryptoHash,
    };
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

export const getExecutionStep = (
  receipt: RpcActionReceiptTrimmed,
  receiptOutcome: RpcReceiptOutcome,
  receiptCreationMap: ReceiptCreationMap,
): ExecutionStep => {
  const { Action } = receipt.receipt;

  const dataReceivers = Action.outputDataReceivers.map(({ dataId, receiverId }) => ({
    dataId,
    receiverAccountId: receiverId,
  }));

  return {
    receiptId: receipt.receiptId,
    receiptSummary: {
      createdBy: {
        accountId: receipt.predecessorId,
      },
      createdAt: { blockHash: receiptCreationMap[receipt.receiptId].createdAtBlockHash },
      actionSummaries: Action.actions,
      requiredDataIds: Action.inputDataIds,
      futureDataReceivers: dataReceivers,
      isPromiseYield: Action.isPromiseYield,
    },
    result: getExecutionStepOutcome(receiptOutcome.outcome.status),
    executedBy: { accountId: receiptOutcome.outcome.executorId },
    executedAt: { blockHash: receiptOutcome.blockHash.cryptoHash },
    createdReceiptIds: receiptOutcome.outcome.receiptIds.map(({ cryptoHash }) => cryptoHash),
    gasFee: yoctoNear(receiptOutcome.outcome.tokensBurnt),
    gasUsed: gas(receiptOutcome.outcome.gasBurnt),
    logs: receiptOutcome.outcome.logs,
  };
};
