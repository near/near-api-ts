import type { InnerCallContractReadFunctionArgs } from 'nat-types/client/methods/contract/callContractReadFunction';
import { wrapInternalError } from '@common/utils/wrapInternalError';
import { result } from '@common/utils/result';
import { fromJsonBytes } from '@common/utils/common';
import type { Result } from 'nat-types/_common/common';
import type { NatError } from '@common/natError';

export const deserializeCallResult = (
  args: InnerCallContractReadFunctionArgs,
  rawResult: number[],
): Result<
  unknown,
  NatError<'Client.CallContractReadFunction.DeserializeResult.Internal'>
> => {
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
    return result.ok(undefined);
  }
};
