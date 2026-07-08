import type { Base64String, Result } from '../../../../../../../types/_common/common';
import type { InnerGetTransactionResultArgs } from '../../../../../../../types/client/methods/transaction/getTransactionResult';
import { type NatError, resultNatError } from '../../../../../../_common/natError';
import { result } from '../../../../../../_common/utils/result';
import { tryParseBase64ToObject } from '../../../../../../_common/utils/tryParseBase64ToObject';

export const deserializeResultData = (
  rawData: Base64String,
  inputArgs: InnerGetTransactionResultArgs,
): Result<unknown, NatError<'Client.GetTransactionResult.DeserializeResultData.Failed'>> => {
  // If a user wants to use his own custom deserializer:
  if (inputArgs.options?.deserializeResultData) {
    try {
      return result.ok(inputArgs.options.deserializeResultData({ rawData }));
    } catch (cause) {
      return resultNatError('Client.GetTransactionResult.DeserializeResultData.Failed', {
        cause,
        rawData,
      });
    }
  }
  // If no custom deserializer:
  return result.ok(tryParseBase64ToObject(rawData));
};
