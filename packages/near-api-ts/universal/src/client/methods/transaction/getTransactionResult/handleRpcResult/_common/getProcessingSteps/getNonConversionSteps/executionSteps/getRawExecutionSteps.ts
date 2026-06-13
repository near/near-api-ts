import { gas, yoctoNear } from '../../../../../../../../../../index';
import type { Base64String } from '../../../../../../../../../../types/_common/common';
import type {
  ExecutionStepResult,
  RawExecutionStep,
} from '../../../../../../../../../../types/_common/transactionDetails/processingSteps/executionSteps/executionStep';
import type { RpcActionReceiptTrimmed } from '../../../../../../../../../_common/schemas/zod/rpc/transactionDetails/receipt';
import type { RpcReceiptOutcome } from '../../../../../../../../../_common/schemas/zod/rpc/transactionDetails/receiptOutcome';
import { getRawActionSummary } from '../../_common/getActionSummaries';
import type { ReceiptCreationMap } from '../createReceiptCreationMap';
import type { ReceiptsWithOutcomes } from '../getReceiptsWithOutcomes';

const getRawExecutionStepResult = (
  status: RpcReceiptOutcome['outcome']['status'],
): ExecutionStepResult<Base64String> => {
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

const getRawExecutionStep = (
  receipt: RpcActionReceiptTrimmed,
  receiptOutcome: RpcReceiptOutcome,
  receiptCreationMap: ReceiptCreationMap,
): RawExecutionStep => {
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
    result: getRawExecutionStepResult(receiptOutcome.outcome.status),
    createdAt: receiptCreationMap[receipt.receiptId].createdAt,
    createdBy: { accountId: receipt.predecessorId },
    executedAt: { blockHash: receiptOutcome.blockHash.cryptoHash },
    executedBy: { accountId: receiptOutcome.outcome.executorId },
    actionSummaries: Action.actions.map(getRawActionSummary),
    producedSteps,
    requiredDataIds: Action.inputDataIds,
    futureDataReceivers: dataReceivers,
    isPromiseYield: Action.isPromiseYield,
    gasFee: yoctoNear(receiptOutcome.outcome.tokensBurnt),
    gasUsed: gas(receiptOutcome.outcome.gasBurnt),
    logs: receiptOutcome.outcome.logs,
  };
};

export const getRawExecutionSteps = (
  receiptsWithOutcomes: ReceiptsWithOutcomes,
  receiptCreationMap: ReceiptCreationMap,
): RawExecutionStep[] =>
  receiptsWithOutcomes
    .filter(({ receipt }) => receipt.predecessorId !== 'system')
    .map(({ receipt, receiptOutcome }) =>
      getRawExecutionStep(receipt, receiptOutcome, receiptCreationMap),
    );
