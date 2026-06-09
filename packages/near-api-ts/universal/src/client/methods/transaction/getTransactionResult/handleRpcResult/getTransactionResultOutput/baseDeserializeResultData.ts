import type { Base64String, Result } from '../../../../../../../types/_common/common';
import type { InnerGetTransactionResultArgs } from '../../../../../../../types/client/methods/transaction/getTransactionResult';
import { type NatError, resultNatError } from '../../../../../../_common/natError';
import { fromJsonBytes } from '../../../../../../_common/utils/common';
import { result } from '../../../../../../_common/utils/result';

export const baseDeserializeResultData = (
  inputArgs: InnerGetTransactionResultArgs,
  data: Base64String,
): Result<unknown, NatError<'Client.GetTransactionResult.DeserializeResultData.Failed'>> => {
  // If a user wants to use his own custom deserializer:
  if (inputArgs.options?.deserializeResultData) {
    try {
      return result.ok(inputArgs.options.deserializeResultData({ data }));
    } catch (cause) {
      return resultNatError('Client.GetTransactionResult.DeserializeResultData.Failed', {
        cause,
        data,
      });
    }
  }
  // If no custom deserializer:

  // nearcore returns empty string when there is no result data;
  // So for better readability, we return null instead of empty string;
  if (data === '') return result.ok(null);

  // Try our best - if we can parse the data as JSON, return the parsed result;
  // otherwise, return the raw base64 data;
  try {
    return result.ok(fromJsonBytes(Uint8Array.fromBase64(data)));
  } catch (e) {
    return result.ok(data);
  }
};
