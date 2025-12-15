import type { InnerCallContractReadFunctionArgs } from 'nat-types/client/methods/contract/callContractReadFunction';
import { wrapInternalError } from '@common/utils/wrapInternalError';
import { result } from '@common/utils/result';
import { fromJsonBytes } from '@common/utils/common';

export const deserializeCallResult = (
  args: InnerCallContractReadFunctionArgs,
  rawResult: number[],
) => {
  // If user want to use his own custom deserializer;
  if (args.options?.deserializeResult) {
    const deserializeResult = args.options.deserializeResult;
    return wrapInternalError(
      'Client.CallContractReadFunction.DeserializeResult.Internal',
      () => result.ok(deserializeResult({ rawResult })),
    )();
  }

  // If bytes are JSON - parse it and return;
  try {
    const res = fromJsonBytes(rawResult);
    return result.ok(res);
  } catch (e) {
    result.ok(undefined);
  }
};
