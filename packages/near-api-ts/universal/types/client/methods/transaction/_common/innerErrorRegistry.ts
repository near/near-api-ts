import type { Base64String } from '../../../../_common/common';
import type { ExhaustedErrorContext } from '../../../transport/sendRequest';
import type { RawTransactionActionSummary } from './transactionDetails/_common/_common/actionSummaries';
import type { ProtocolEra } from './transactionDetails/_common/_common/protocolEra';
import type { RawExecutionStep } from './transactionDetails/_common/executionStep';

// Each method names these with the protocol eras its details hold
export type DeserializeActionSummariesFailedContext<PE extends ProtocolEra> = {
  cause: unknown;
  rawActionSummaries: RawTransactionActionSummary<PE>[];
};

export type DeserializeExecutionStepsFailedContext<PE extends ProtocolEra> = {
  cause: unknown;
  rawExecutionSteps: RawExecutionStep<PE>[];
};

// The builders the methods share read any transaction, so their errors hold data of every era
export interface TransactionDetailsInnerErrorRegistry {
  'Inner.Client.TransactionDetails.Exhausted': ExhaustedErrorContext;
  'Inner.Client.TransactionDetails.DeserializeResultData.Failed': {
    cause: unknown;
    rawData: Base64String;
  };
  'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed': DeserializeActionSummariesFailedContext<
    'Live' | 'Legacy'
  >;
  'Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed': DeserializeExecutionStepsFailedContext<
    'Live' | 'Legacy'
  >;
}
