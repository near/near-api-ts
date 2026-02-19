import type { Result } from '@universal/types/_common/common';
import type { InnerCallContractReadFunctionArgs } from '@universal/types/client/methods/contract/callContractReadFunction';
import type { NatError } from '../../../../../_common/natError';
import { fromJsonBytes } from '../../../../../_common/utils/common';
import { result } from '../../../../../_common/utils/result';
import { wrapInternalError } from '../../../../../_common/utils/wrapInternalError';

export const deserializeCallResult = (
  args: InnerCallContractReadFunctionArgs,
  rawResult: number[],
): Result<
  unknown,
  NatError<'Client.CallContractReadFunction.DeserializeResult.Internal'>
> => {
  // If a user wants to use his own custom deserializer;
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
