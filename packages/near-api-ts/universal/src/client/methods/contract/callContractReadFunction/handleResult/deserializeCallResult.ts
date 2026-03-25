import type { Result } from '../../../../../../types/_common/common';
import type { InnerCallContractReadFunctionArgs } from '../../../../../../types/client/methods/contract/callContractReadFunction';
import { createNatError, type NatError } from '../../../../../_common/natError';
import { fromJsonBytes } from '../../../../../_common/utils/common';
import { result } from '../../../../../_common/utils/result';

export const deserializeCallResult = (
  args: InnerCallContractReadFunctionArgs,
  rawResult: number[],
): Result<
  unknown,
  | NatError<'Client.CallContractReadFunction.ResultDeserialization.JsonParseFailed'>
  | NatError<'Client.CallContractReadFunction.DeserializeResult.Failed'>
> => {
  // If a user wants to use his own custom deserializer;
  if (args.options?.deserializeResult) {
    try {
      result.ok(args.options.deserializeResult({ rawResult }));
    } catch (e) {
      return result.err(
        createNatError({
          kind: 'Client.CallContractReadFunction.DeserializeResult.Failed',
          context: { cause: e, rawResult },
        }),
      );
    }
  }

  // If bytes are JSON - try to parse it;
  try {
    return result.ok(fromJsonBytes(rawResult));
  } catch (e) {
    return result.err(
      createNatError({
        kind: 'Client.CallContractReadFunction.ResultDeserialization.JsonParseFailed',
        context: { cause: e, rawResult },
      }),
    );
  }
};
