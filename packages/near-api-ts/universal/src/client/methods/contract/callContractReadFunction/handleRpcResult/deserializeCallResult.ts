import type { Result } from '../../../../../../types/_common/common';
import type { InnerCallContractReadFunctionArgs } from '../../../../../../types/client/methods/contract/callContractReadFunction';
import { createNatError, type NatError } from '../../../../../_common/natError';
import { tryBase64ToObject } from '../../../../../_common/utils/base64ToObject';
import { result } from '../../../../../_common/utils/result';

export const deserializeCallResult = (
  args: InnerCallContractReadFunctionArgs,
  rawResult: number[],
): Result<unknown, NatError<'Client.CallContractReadFunction.DeserializeResult.Failed'>> => {
  // For some reason nearcore returns raw bytes - number[] - instead of base64 for this method;
  // We want to have a consistent format with transaction result/details - for the transaction
  // result, functionArgs etc. nearcore returns base64;
  const rawResultBase64 = Uint8Array.from(rawResult).toBase64();

  // If a user wants to use his own custom deserializer;
  if (args.options?.deserializeResult) {
    try {
      result.ok(args.options.deserializeResult({ rawResult: rawResultBase64 }));
    } catch (e) {
      return result.err(
        createNatError({
          kind: 'Client.CallContractReadFunction.DeserializeResult.Failed',
          context: { cause: e, rawResult: rawResultBase64 },
        }),
      );
    }
  }

  // try to parse base64 to object;
  return result.ok(tryBase64ToObject(rawResultBase64));
};
