import { gas, yoctoNear } from '../../../../../../../../../../index';
import type {
  ExecutionStep,
  ExecutionStepResult,
} from '../../../../../../../../../../types/_common/transactionDetails/processingSteps/executionStep';
import type { RpcActionReceiptTrimmed } from '../../../../../../../../../_common/schemas/zod/rpc/transactionDetails/receipt';
import type { RpcReceiptOutcome } from '../../../../../../../../../_common/schemas/zod/rpc/transactionDetails/receiptOutcome';
import type { ReceiptCreationMap } from '../createReceiptCreationMap';

const getExecutionStepResult = (
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
      status: 'Continuation',
      nextExecutionStepId: status.SuccessReceiptId.cryptoHash,
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

const getExecutionStepBase = (
  receipt: RpcActionReceiptTrimmed,
  receiptOutcome: RpcReceiptOutcome,
  receiptCreationMap: ReceiptCreationMap,
): Omit<ExecutionStep, 'createdBy' | 'createdAt'> => {
  const { Action } = receipt.receipt;

  const dataReceivers = Action.outputDataReceivers.map(({ dataId, receiverId }) => ({
    dataId,
    receiverAccountId: receiverId,
  }));

  // During execution, receipt may create new receipts, like as TS function may produce new promises;
  const producedSteps = receiptOutcome.outcome.receiptIds.map(({ cryptoHash }) => {
    const { kind } = receiptCreationMap[cryptoHash];
    return kind === 'Execution'
      ? {
          kind,
          executionStepId: cryptoHash,
        }
      : {
          kind,
          refundStepId: cryptoHash,
        };
  });

  return {
    executionStepId: receipt.receiptId,
    result: getExecutionStepResult(receiptOutcome.outcome.status),
    executedAt: { blockHash: receiptOutcome.blockHash.cryptoHash },
    executedBy: { accountId: receiptOutcome.outcome.executorId },
    producedSteps,
    actionSummaries: Action.actions as any, // TODO Fix
    requiredDataIds: Action.inputDataIds,
    futureDataReceivers: dataReceivers,
    isPromiseYield: Action.isPromiseYield,
    gasFee: yoctoNear(receiptOutcome.outcome.tokensBurnt),
    gasUsed: gas(receiptOutcome.outcome.gasBurnt),
    logs: receiptOutcome.outcome.logs,
  };
};

export const getExecutionStep = (
  receipt: RpcActionReceiptTrimmed,
  receiptOutcome: RpcReceiptOutcome,
  receiptCreationMap: ReceiptCreationMap,
): ExecutionStep => {
  const base = getExecutionStepBase(receipt, receiptOutcome, receiptCreationMap);
  const { createdAt } = receiptCreationMap[receipt.receiptId];

  // We don't use spread operator for ExecutionStepBase properties because it would break a
  // logical grouping of properties and make a transaction reading in the console more difficult
  const { executionStepId, result, ...restBase } = base;

  return {
    executionStepId,
    result,
    createdAt,
    createdBy: {
      accountId: receipt.predecessorId,
    },
    ...restBase,
  };
};
