import type { Result } from '../../../../../types/_common/common';
import { createNatError, NatError } from '../../../../_common/natError';
import { wrapInternalError } from '../../../../_common/utils/wrapInternalError';
import { result } from '../../../../_common/utils/result';
import { JsonSchema } from '../../../../_common/schemas/zod/common/common';
import { toJsonBytes } from '../../../../_common/utils/common';
import type { InnerCallContractReadFunctionArgs } from '../../../../../types/client/methods/contract/callContractReadFunction';

// TODO maybe we can unite it with functionCall action creator?

export const serializeFunctionArgs = (
  args: InnerCallContractReadFunctionArgs,
): Result<
  Uint8Array,
  | NatError<'Client.CallContractReadFunction.SerializeArgs.InvalidOutput'>
  | NatError<'Client.CallContractReadFunction.SerializeArgs.Internal'>
  | NatError<'Client.CallContractReadFunction.Args.InvalidSchema'>
> => {
  // If user want to use his own custom serializer;
  if (args.options?.serializeArgs) {
    const serializeArgs = args.options.serializeArgs;
    return wrapInternalError(
      'Client.CallContractReadFunction.SerializeArgs.Internal',
      () => {
        // We can't be sure that serializeArgs will really return Uint8Array;
        const output: unknown = serializeArgs({
          functionArgs: args.functionArgs,
        });
        // If users serializer returns not a valid Uint8Array args;
        if (!(output instanceof Uint8Array))
          return result.err(
            createNatError({
              kind: 'Client.CallContractReadFunction.SerializeArgs.InvalidOutput',
              context: { output },
            }),
          );
        return result.ok(output);
      },
    )();
  }

  // If a user use a default serializer and pass some functionArgs -
  // functionArgs should be a valid JSON object;
  if (args.functionArgs) {
    const jsonArgs = JsonSchema.safeParse(args.functionArgs);

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
