import type { Result } from '@universal/types/_common/common';
import type { InnerCallContractReadFunctionArgs } from '@universal/types/client/methods/contract/callContractReadFunction';
import { createNatError, NatError } from '../../../../_common/natError';
import { JsonValueSchema } from '../../../../_common/schemas/zod/common/common';
import { toJsonBytes } from '../../../../_common/utils/common';
import { result } from '../../../../_common/utils/result';

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
        return result.err(
          createNatError({
            kind: 'Client.CallContractReadFunction.SerializeArgs.InvalidOutput',
            context: { output },
          }),
        );

      return result.ok(output);
    } catch (e) {
      return result.err(
        createNatError({
          kind: 'Client.CallContractReadFunction.SerializeArgs.Failed',
          context: { cause: e, functionArgs: args.functionArgs },
        }),
      );
    }
  }

  // If a user uses a default serializer and passes some functionArgs -
  // functionArgs should be a valid JSON object;
  if (args.functionArgs) {
    const jsonArgs = JsonValueSchema.safeParse(args.functionArgs);

    if (!jsonArgs.success)
      return result.err(
        createNatError({
          kind: 'Client.CallContractReadFunction.Args.InvalidSchema',
          context: { zodError: jsonArgs.error },
        }),
      );

    return result.ok(toJsonBytes(args.functionArgs));
  }

  // If no functionArgs and serializeArgs - return placeholder;
  return result.ok(new Uint8Array());
};
