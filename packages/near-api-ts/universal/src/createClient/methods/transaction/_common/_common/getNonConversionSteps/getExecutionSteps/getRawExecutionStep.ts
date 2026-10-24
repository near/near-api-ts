import type { Base64String } from '../../../../../../../../types/_common/common';
import type { ExecutionFailureErrorOfEra } from '../../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/executionFailureError';
import type { ProtocolEra } from '../../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/protocolEra';
import type {
  ExecutionStepResult,
  RawExecutionStep,
} from '../../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/executionStep';
import { gas } from '../../../../../../../_common/nearGas';
import { yoctoNear } from '../../../../../../../_common/nearToken';
import type { RpcActionReceiptTrimmed } from '../../../zodSchemas/rpcTransactionDetails/rpcActionReceipt';
import type { RpcReceiptOutcome } from '../../../zodSchemas/rpcTransactionDetails/rpcReceiptOutcome';
import { getRawActionSummary } from '../../_common/_common/getRawActionSummary/getRawActionSummary';
import { getExecutionFailureError } from '../../_common/getExecutionFailureError/getExecutionFailureError';
import type { ReceiptCreationMap } from '../createReceiptCreationMap';

const getRawExecutionStepResult = <PE extends ProtocolEra>(
  status: RpcReceiptOutcome['outcome']['status'],
  receiptActions: RpcActionReceiptTrimmed['receipt']['Action']['actions'],
): ExecutionStepResult<PE, Base64String> => {
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

  // We can't reuse an error from result.error because every evecution step may contain its own error
  // not related to transaction error. For example - may be 3 execution steps with errors, but only
  // one of them may be related to the transaction error
  if (typeof status === 'object' && 'Failure' in status) {
    return {
      status: 'Failure',
      // `'Legacy'` adds no execution failure yet, so every one is of any era
      error: getExecutionFailureError(
        status.Failure.ActionError,
        receiptActions,
      ) as ExecutionFailureErrorOfEra<PE>,
    };
  }

  // Should never happen as we cover all possible cases
  throw new Error(`Unexpected receipt execution outcome status: ${JSON.stringify(status)}`);
};

export const getRawExecutionStep = <PE extends ProtocolEra>(
  receipt: RpcActionReceiptTrimmed,
  receiptOutcome: RpcReceiptOutcome,
  receiptCreationMap: ReceiptCreationMap,
  protocolEras: PE[],
): RawExecutionStep<PE> => {
  const { Action } = receipt.receipt;

  // During execution, an execution step may create new execution steps
  const producedSteps = receiptOutcome.outcome.receiptIds.map(({ cryptoHash }) => {
    const stepType = receiptCreationMap[cryptoHash].kind;
    return stepType === 'Execution'
      ? { stepType, executionStepId: cryptoHash }
      : { stepType, refundStepId: cryptoHash };
  });

  const requiredData = Action.inputDataIds.map((dataId) => ({ dataId }));

  const futureDataReceivers = Action.outputDataReceivers.map(({ dataId, receiverId }) => ({
    dataId,
    receiverAccountId: receiverId,
  }));

  return {
    executionStepId: receipt.receiptId,
    result: getRawExecutionStepResult<PE>(receiptOutcome.outcome.status, Action.actions),
    createdAt: receiptCreationMap[receipt.receiptId].createdAt,
    createdBy: { accountId: receipt.predecessorId },
    executedAt: { blockHash: receiptOutcome.blockHash.cryptoHash },
    executedBy: { accountId: receiptOutcome.outcome.executorId },
    actionSummaries: Action.actions.map((rpcAction) =>
      getRawActionSummary(rpcAction, protocolEras),
    ),
    producedSteps,
    requiredData,
    futureDataReceivers,
    isPromiseYield: Action.isPromiseYield,
    gasFee: yoctoNear(receiptOutcome.outcome.tokensBurnt),
    gasUsed: gas(receiptOutcome.outcome.gasBurnt),
    logs: receiptOutcome.outcome.logs,
  };
};
