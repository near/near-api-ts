import type {
  ParsedActionSummary,
  RawActionSummary,
} from '../../../../../../../types/_common/transactionDetails/actionSummaries';
import { tryBase64ToObject } from '../../../../../../_common/utils/base64ToObject';

// Default deserialization of the raw action summary - tries to parse functionCall.functionArgs
// as JSON, otherwise keeps the raw base64 string (functionArgs type stays unknown);
export const getParsedActionSummary = (rawActionSummary: RawActionSummary): ParsedActionSummary => {
  if (rawActionSummary.actionType === 'FunctionCall') {
    return {
      ...rawActionSummary,
      functionArgs: tryBase64ToObject(rawActionSummary.functionArgs),
    };
  }
  return rawActionSummary;
};
