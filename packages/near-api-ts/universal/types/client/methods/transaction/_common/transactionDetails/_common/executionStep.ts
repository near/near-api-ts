import type { AccountId, Base64String, BlockHash, CryptoHash, Log, ReceiptId } from '../../../../../../_common/common';
import type { NearGas } from '../../../../../../_common/nearGas';
import type { NearToken } from '../../../../../../_common/nearToken';
import type { ParsedActionSummary, RawActionSummary } from './_common/actionSummaries';
import type {
  BaseDeserializeTransactionExecutionStepsFn,
  MaybeBaseDeserializeTransactionExecutionStepsFn,
} from './_common/deserializers';
import type { ExecutionFailureError } from './_common/executionFailureError';

type RequiredDataItem = { dataId: CryptoHash };

type FutureDataReceiver = {
  dataId: CryptoHash;
  receiverAccountId: AccountId;
};

export type ExecutionStepResult<RD> =
  | {
      status: 'Success';
      data: RD;
    }
  | {
      status: 'Continuation';
      nextExecutionStepId: ReceiptId;
    }
  | {
      status: 'Failure';
      error: ExecutionFailureError;
    };

type ProducedStep =
  | { kind: 'Execution'; executionStepId: ReceiptId }
  | { kind: 'Refund'; refundStepId: ReceiptId };

export type ExecutionStep<RD, AS> = {
  executionStepId: ReceiptId;
  result: ExecutionStepResult<RD>;
  createdAt: { blockHash: BlockHash };
  createdBy: { accountId: AccountId };
  executedAt: { blockHash: BlockHash };
  executedBy: { accountId: AccountId };
  actionSummaries: AS;
  producedSteps: ProducedStep[];
  requiredData: RequiredDataItem[];
  futureDataReceivers: FutureDataReceiver[];
  isPromiseYield: boolean;
  gasFee: NearToken;
  gasUsed: NearGas;
  logs: Log[];
};

export type ParsedExecutionStep = ExecutionStep<unknown, ParsedActionSummary[]>;
export type RawExecutionStep = ExecutionStep<Base64String, RawActionSummary[]>;

export type ExecutionSteps<
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> = [ESF] extends [BaseDeserializeTransactionExecutionStepsFn]
  ? ReturnType<ESF>
  : ParsedExecutionStep[];
