import type { Base64String } from '../../../../_common/common';
import type { RawActionSummary } from '../../../../_common/transactionDetails/actionSummaries';
import type { RawExecutionStep } from '../../../../_common/transactionDetails/processingSteps/executionSteps/executionStep';
import type { ExhaustedErrorContext } from '../../../transport/sendRequest';

export interface TransactionDetailsInnerErrorRegistry {
  'Inner.Client.TransactionDetails.Exhausted': ExhaustedErrorContext;
  'Inner.Client.TransactionDetails.DeserializeResultData.Failed': {
    cause: unknown;
    rawData: Base64String;
  };
  'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed': {
    cause: unknown;
    rawActionSummaries: RawActionSummary[];
  };
  'Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed': {
    cause: unknown;
    rawExecutionSteps: RawExecutionStep[];
  };
}
