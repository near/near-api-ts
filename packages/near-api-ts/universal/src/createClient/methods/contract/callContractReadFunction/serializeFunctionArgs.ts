import type { Result } from '../../../../../types/_common/common';
import type { InnerCallContractReadFunctionArgs } from '../../../../../types/client/methods/contract/callContractReadFunction';
import { NatError } from '../../../../_common/_common/_common/_common/natError';
import { result, resultNatError } from '../../../../_common/_common/_common/result';
import { convertObjectToU8 } from '../../../../_common/convertObjectToU8';
import { JsonValueZodSchema } from '../../../../_common/zodSchemas/jsonValue';

export const serializeFunctionArgs = (
  args: InnerCallContractReadFunctionArgs,
): Result<
  Uint8Array,
  | NatError<'Client.CallContractReadFunction.SerializeArgs.InvalidOutput'>
  | NatError<'Client.CallContractReadFunction.SerializeArgs.Failed'>
  | NatError<'Client.CallContractReadFunction.Args.InvalidSchema'>
> => {
  // If a user wants to use his own custom serializer;
  if (args.options?.serializeArgs) {
    try {
      // We can't be sure that users serializeArgs will really return Uint8Array;
      const output: unknown = args.options.serializeArgs({
        functionArgs: args.functionArgs,
      });

      // If users serializer returns not a valid Uint8Array args - throw an error;
      if (!(output instanceof Uint8Array))
        return resultNatError('Client.CallContractReadFunction.SerializeArgs.InvalidOutput', {
          output,
        });

      return result.ok(output);
    } catch (e) {
      return resultNatError('Client.CallContractReadFunction.SerializeArgs.Failed', {
        cause: e,
        functionArgs: args.functionArgs,
      });
    }
  }

  // If a user uses a default serializer and passes some functionArgs -
  // functionArgs should be a valid JSON object;
  if (args.functionArgs) {
    const jsonArgs = JsonValueZodSchema.safeParse(args.functionArgs);

    if (!jsonArgs.success)
      return resultNatError('Client.CallContractReadFunction.Args.InvalidSchema', {
        zodError: jsonArgs.error,
      });

    return result.ok(convertObjectToU8(args.functionArgs));
  }

  // If no functionArgs and serializeArgs - return placeholder;
  return result.ok(new Uint8Array());
};
