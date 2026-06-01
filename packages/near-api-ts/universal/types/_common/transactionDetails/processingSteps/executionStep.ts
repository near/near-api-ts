import type {
  AccountId,
  BlockHash,
  CryptoHash,
  Log,
  ReceiptId,
  TransactionHash,
} from '../../common';
import type { NearGas } from '../../nearGas';
import type { NearToken } from '../../nearToken';
import type { ActionSummaries } from '../actionSummaries';

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

type ExecutionStepCommon = {
  executionStepId: ReceiptId;
  result: ExecutionStepResult;
  createdAt: { blockHash: BlockHash };
  executedAt: { blockHash: BlockHash };
  executedBy: { accountId: AccountId };
  producedSteps: ProducedStep[];
  actionSummaries: ActionSummaries;
  requiredDataIds: RequiredDataId[];
  futureDataReceivers: FutureDataReceiver[];
  isPromiseYield: boolean;
  gasFee: NearToken;
  gasUsed: NearGas;
  logs: Log[];
};

export type FirstExecutionStep = ExecutionStepCommon & {
  createdBy: { accountId: AccountId; conversionStepId: TransactionHash };
};

export type ExecutionStep = ExecutionStepCommon & {
  createdBy: { accountId: AccountId; executionStepId: ReceiptId };
};

export type ExecutionSteps = [FirstExecutionStep, ...ExecutionStep[]] | [];

/*

createdAt: { blockHash: BlockHash };
    createdBy: { accountId: AccountId };
    createdDuring: { step: 'Conversion' } | { step: 'Execution'; receiptId: ReceiptId };


    created: {
      at: { blockHash: BlockHash };
      by: { accountId: AccountId };
      during: { step: 'Conversion' } | { step: 'Execution'; receiptId: ReceiptId };
    };

      executedAt: { blockHash: BlockHash };
    executedBy: { accountId: AccountId };

     executed: {
      at: { blockHash: BlockHash };
      by: { accountId: AccountId };
    };
 */
