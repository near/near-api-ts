import type {
  ParsedTransactionActionSummary,
  RawTransactionActionSummary,
} from '../../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/actionSummaries';
import { tryBase64ToObject } from '../../../../../_common/base64ToObject';

// Default deserialization of the raw action summary - tries to parse functionCall.functionArgs
// as JSON, otherwise keeps the raw base64 string (functionArgs type stays unknown);
export const getParsedActionSummary = (
  rawActionSummary: RawTransactionActionSummary,
): ParsedTransactionActionSummary => {
  if (rawActionSummary.actionType === 'FunctionCall')
    return {
      ...rawActionSummary,
      functionArgs: tryBase64ToObject(rawActionSummary.functionArgs),
    };

  if (rawActionSummary.actionType === 'ExecuteDelegation')
    return {
      ...rawActionSummary,
      delegation: {
        ...rawActionSummary.delegation,
        // Parse all delegated function call args
        delegatedActionSummaries: rawActionSummary.delegation.delegatedActionSummaries.map(
          (rawActionSummary) =>
            rawActionSummary.actionType === 'FunctionCall'
              ? {
                  ...rawActionSummary,
                  functionArgs: tryBase64ToObject(rawActionSummary.functionArgs),
                }
              : rawActionSummary,
        ),
      },
    };

  return rawActionSummary;
};
