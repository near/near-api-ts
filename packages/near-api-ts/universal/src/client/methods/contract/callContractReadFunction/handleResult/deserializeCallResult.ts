import type { InnerCallContractReadFunctionArgs } from '../../../../../../types/client/methods/contract/callContractReadFunction';
import { wrapInternalError } from '../../../../../_common/utils/wrapInternalError';
import { result } from '../../../../../_common/utils/result';
import { fromJsonBytes } from '../../../../../_common/utils/common';
import type { Result } from '../../../../../../types/_common/common';
import type { NatError } from '../../../../../_common/natError';

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
