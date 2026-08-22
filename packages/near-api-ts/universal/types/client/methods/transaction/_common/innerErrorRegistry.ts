import type { Base64String } from '../../../../_common/common';
import type { ExhaustedErrorContext } from '../../../transport/sendRequest';
import type { RawTransactionActionSummary } from './transactionDetails/_common/_common/actionSummaries';
import type { RawExecutionStep } from './transactionDetails/_common/executionStep';

export interface TransactionDetailsInnerErrorRegistry {
  'Inner.Client.TransactionDetails.Exhausted': ExhaustedErrorContext;
  'Inner.Client.TransactionDetails.DeserializeResultData.Failed': {
    cause: unknown;
    rawData: Base64String;
  };
  'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed': {
    cause: unknown;
    rawActionSummaries: RawTransactionActionSummary[];
  };
  'Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed': {
    cause: unknown;
    rawExecutionSteps: RawExecutionStep[];
  };
}
