import type { Result } from '../../../../../../types/_common/common';
import type { InnerCallContractReadFunctionArgs } from '../../../../../../types/client/methods/contract/callContractReadFunction';
import { createNatError, type NatError } from '../../../../../_common/natError';
import { result } from '../../../../../_common/utils/result';
import { tryParseBase64ToObject } from '../../../../../_common/utils/tryParseBase64ToObject';

export const deserializeCallResult = (
  args: InnerCallContractReadFunctionArgs,
  rawResult: number[],
): Result<unknown, NatError<'Client.CallContractReadFunction.DeserializeResult.Failed'>> => {
  // For some reason nearcore returns raw bytes - number[] - instead of base64 for this method;
  // We want to have a consistent format with transaction result/details - for the transaction
  // result, functionArgs etc. nearcore returns base64;
  const resultBase64 = Uint8Array.from(rawResult).toBase64();

  // If a user wants to use his own custom deserializer;
  if (args.options?.deserializeResult) {
    try {
      result.ok(args.options.deserializeResult({ resultBase64 }));
    } catch (e) {
      return result.err(
        createNatError({
          kind: 'Client.CallContractReadFunction.DeserializeResult.Failed',
          context: { cause: e, resultBase64 },
        }),
      );
    }
  }

  // try to parse base64 to object;
  return result.ok(tryParseBase64ToObject(resultBase64));
};
