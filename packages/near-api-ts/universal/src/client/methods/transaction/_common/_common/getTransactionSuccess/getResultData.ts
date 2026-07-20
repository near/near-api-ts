import type { Base64String, Result } from '../../../../../../../types/_common/common';
import type { BaseDeserializeTransactionResultDataFn } from '../../../../../../../types/_common/transactionDetails/deserializers';
import { type NatError, resultNatError } from '../../../../../../_common/natError';
import { tryBase64ToObject } from '../../../../../../_common/utils/base64ToObject';
import { result } from '../../../../../../_common/utils/result';

export const getResultData = (
  rawData: Base64String,
  deserializeResultData?: BaseDeserializeTransactionResultDataFn,
): Result<unknown, NatError<'Inner.Client.TransactionDetails.DeserializeResultData.Failed'>> => {
  // If a user wants to use his own custom deserializer:
  if (deserializeResultData) {
    try {
      return result.ok(deserializeResultData({ rawData }));
    } catch (cause) {
      return resultNatError('Inner.Client.TransactionDetails.DeserializeResultData.Failed', {
        cause,
        rawData,
      });
    }
  }
  // If no custom deserializer:
  return result.ok(tryBase64ToObject(rawData));
};
