import type { Base64String } from '../../../../../../../../types/_common/common';
import type {
  DelegatedActionSummary,
  ParsedTransactionActionSummary,
  RawTransactionActionSummary,
} from '../../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/actionSummaries';
import { tryBase64ToObject } from '../../../../../_common/base64ToObject';

const getParsedDelegatedActionSummary = (
  rawActionSummary: DelegatedActionSummary<'Live' | 'Legacy', Base64String>,
): DelegatedActionSummary<'Live' | 'Legacy', unknown> =>
  rawActionSummary.actionType === 'CallContractFunction'
    ? { ...rawActionSummary, functionArgs: tryBase64ToObject(rawActionSummary.functionArgs) }
    : rawActionSummary;

// Default deserialization of the raw action summary - tries to parse callContractFunction.functionArgs
// as JSON, otherwise keeps the raw base64 string (functionArgs type stays unknown);
export const getParsedActionSummary = (
  rawActionSummary: RawTransactionActionSummary<'Live' | 'Legacy'>,
): ParsedTransactionActionSummary<'Live' | 'Legacy'> => {
  if (rawActionSummary.actionType === 'CallContractFunction')
    return {
      ...rawActionSummary,
      functionArgs: tryBase64ToObject(rawActionSummary.functionArgs),
    };

  // Parse all delegated function call args
  if (rawActionSummary.actionType === 'ExecuteDelegation')
    return {
      ...rawActionSummary,
      delegation: {
        ...rawActionSummary.delegation,
        delegatedActionSummaries: rawActionSummary.delegation.delegatedActionSummaries.map(
          getParsedDelegatedActionSummary,
        ),
      },
    };

  if (rawActionSummary.actionType === 'LegacyExecuteDelegation')
    return {
      ...rawActionSummary,
      delegation: {
        ...rawActionSummary.delegation,
        delegatedActionSummaries: rawActionSummary.delegation.delegatedActionSummaries.map(
          getParsedDelegatedActionSummary,
        ),
      },
    };

  return rawActionSummary;
};
