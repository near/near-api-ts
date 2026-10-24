import type {
  AccountId,
  Base64String,
  BlockHash,
  CryptoHash,
  Log,
  ReceiptId,
} from '../../../../../../_common/common';
import type { NearGas } from '../../../../../../_common/nearGas';
import type { NearToken } from '../../../../../../_common/nearToken';
import type {
  ParsedTransactionActionSummary,
  RawTransactionActionSummary,
} from './_common/actionSummaries';
import type {
  BaseDeserializeTransactionExecutionStepsFn,
  MaybeBaseDeserializeTransactionExecutionStepsFn,
} from './_common/deserializers';
import type { ExecutionFailureErrorOfEra } from './_common/executionFailureError';
import type { ProtocolEra } from './_common/protocolEra';

type RequiredDataItem = { dataId: CryptoHash };

type FutureDataReceiver = {
  dataId: CryptoHash;
  receiverAccountId: AccountId;
};

export type ExecutionStepResult<PE extends ProtocolEra, RD> =
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
      error: ExecutionFailureErrorOfEra<PE>;
    };

type ProducedStep =
  | { stepType: 'Execution'; executionStepId: ReceiptId }
  | { stepType: 'Refund'; refundStepId: ReceiptId };

export type ExecutionStep<PE extends ProtocolEra, RD, AS> = {
  executionStepId: ReceiptId;
  result: ExecutionStepResult<PE, RD>;
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

export type ParsedExecutionStep<PE extends ProtocolEra> = ExecutionStep<
  PE,
  unknown,
  ParsedTransactionActionSummary<PE>[]
>;

export type RawExecutionStep<PE extends ProtocolEra> = ExecutionStep<
  PE,
  Base64String,
  RawTransactionActionSummary<PE>[]
>;

// Like `TransactionActionSummaries`
export type ExecutionSteps<
  PE extends ProtocolEra,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn<PE> = undefined,
> = [ESF] extends [BaseDeserializeTransactionExecutionStepsFn<'Live'>]
  ? ReturnType<ESF>
  : ParsedExecutionStep<PE>[];
