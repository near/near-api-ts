import type { AccountId, BlockHash, CryptoHash, Log, ReceiptId } from '../../common';
import type { NearGas } from '../../nearGas';
import type { NearToken } from '../../nearToken';
import type { ActionSummary } from '../actionSummaries';

export type RequiredDataId = CryptoHash;

export type FutureDataReceiver = {
  dataId: CryptoHash;
  receiverAccountId: AccountId;
};

export type ExecutionStepResult =
  | {
      status: 'Success';
      data: unknown;
    }
  | {
      status: 'Continuation';
      nextExecutionStepId: ReceiptId;
    }
  | {
      status: 'Error';
      error: { kind: unknown; context: unknown };
    };

type ProducedStep =
  | { kind: 'Execution'; executionStepId: ReceiptId }
  | { kind: 'Refund'; refundStepId: ReceiptId };

export type ExecutionStep = {
  executionStepId: ReceiptId;
  result: ExecutionStepResult;
  createdAt: { blockHash: BlockHash };
  createdBy: { accountId: AccountId };
  executedAt: { blockHash: BlockHash };
  executedBy: { accountId: AccountId };
  producedSteps: ProducedStep[];
  actionSummaries: ActionSummary[];
  requiredDataIds: RequiredDataId[];
  futureDataReceivers: FutureDataReceiver[];
  isPromiseYield: boolean;
  gasFee: NearToken;
  gasUsed: NearGas;
  logs: Log[];
};

export type ExecutionSteps = ExecutionStep[];
