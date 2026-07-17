import type {
  AccountId,
  Base64String,
  BlockHash,
  CryptoHash,
  Log,
  ReceiptId,
} from '../../../common';
import type { NearGas } from '../../../nearGas';
import type { NearToken } from '../../../nearToken';
import type { ParsedActionSummary, RawActionSummary } from '../../actionSummaries';
import type {
  BaseDeserializeTransactionExecutionStepsFn,
  MaybeBaseDeserializeTransactionExecutionStepsFn,
} from '../../deserializers';
import type { ExecutionError } from './executionError';

export type RequiredDataId = CryptoHash;

export type FutureDataReceiver = {
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
      status: 'Error';
      error: ExecutionError;
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
  requiredDataIds: RequiredDataId[];
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
