import type { Base64String, Result } from '../../../../../../../types/_common/common';
import type { InnerGetTransactionResultArgs } from '../../../../../../../types/client/methods/transaction/getTransactionResult';
import { type NatError, resultNatError } from '../../../../../../_common/natError';
import { result } from '../../../../../../_common/utils/result';
import { baseParseBase64Data } from './_common/parseBase64Data';

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
  return result.ok(baseParseBase64Data(data));
};
