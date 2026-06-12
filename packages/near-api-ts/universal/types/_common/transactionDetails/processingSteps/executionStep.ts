import type { ActionView } from '@near-js/jsonrpc-types';
import type {
  AccountId,
  Base64String,
  BlockHash,
  CryptoHash,
  Log,
  ReceiptId,
} from '../../common';
import type { NearGas } from '../../nearGas';
import type { NearToken } from '../../nearToken';
import type { ActionSummary } from '../actionSummaries';
import type {
  BaseDeserializeTransactionExecutionStepsFn,
  MaybeBaseDeserializeTransactionExecutionStepsFn,
} from '../transactionResult';

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

// Raw variant of ExecutionStepResult - Success data is the raw base64 string from RPC,
// before any deserialization;
export type RawExecutionStepResult =
  | {
      status: 'Success';
      data: Base64String;
    }
  | {
      status: 'Continuation';
      nextExecutionStepId: ReceiptId;
    }
  | {
      status: 'Error';
      error: { kind: unknown; context: unknown };
    };

// Raw variant of ExecutionStep - it's passed to the custom deserializeExecutionSteps
// so a user can process result.data and actionSummaries on his own;
export type RawExecutionStep = {
  executionStepId: ReceiptId;
  result: RawExecutionStepResult;
  createdAt: { blockHash: BlockHash };
  createdBy: { accountId: AccountId };
  executedAt: { blockHash: BlockHash };
  executedBy: { accountId: AccountId };
  producedSteps: ProducedStep[];
  actionSummaries: ActionView[];
  requiredDataIds: RequiredDataId[];
  futureDataReceivers: FutureDataReceiver[];
  isPromiseYield: boolean;
  gasFee: NearToken;
  gasUsed: NearGas;
  logs: Log[];
};

export type RawExecutionSteps = RawExecutionStep[];

// ExecutionSteps type is a return type of custom deserializer (passed by user) or
// the default ExecutionStep[];
export type ExecutionSteps<
  ES extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> = [ES] extends [BaseDeserializeTransactionExecutionStepsFn] ? ReturnType<ES> : ExecutionStep[];
