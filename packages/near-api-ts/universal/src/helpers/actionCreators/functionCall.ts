import * as z from 'zod/mini';
import type { Result } from '../../../types/_common/common';
import type { CreateFunctionCallAction, InnerCreateFunctionCallActionArgs, SafeCreateFunctionCallAction } from '../../../types/actions/functionCall';
import { createNatError, NatError } from '../../_common/natError';
import { ContractFunctionNameSchema, JsonSchema } from '../../_common/schemas/zod/common/common';
import { NearGasArgsSchema } from '../../_common/schemas/zod/common/nearGas';
import { NearTokenArgsSchema } from '../../_common/schemas/zod/common/nearToken';
import { asThrowable } from '../../_common/utils/asThrowable';
import { toJsonBytes } from '../../_common/utils/common';
import { result } from '../../_common/utils/result';
import { wrapInternalError } from '../../_common/utils/wrapInternalError';

const serializeFunctionArgs = (
  args: InnerCreateFunctionCallActionArgs,
): Result<
  Uint8Array,
  | NatError<'CreateAction.FunctionCall.SerializeArgs.InvalidOutput'>
  | NatError<'CreateAction.FunctionCall.SerializeArgs.Internal'>
  | NatError<'CreateAction.FunctionCall.Args.InvalidSchema'>
> => {
  // If user want to use his own custom serializer;
  if (args.options?.serializeArgs) {
    const serializeArgs = args.options.serializeArgs;
    return wrapInternalError(
      'CreateAction.FunctionCall.SerializeArgs.Internal',
      () => {
        // We can't be sure that serializeArgs will really return Uint8Array;
        const output: unknown = serializeArgs({
          functionArgs: args.functionArgs,
        });
        // If users serializer returns not a valid Uint8Array args;
        if (!(output instanceof Uint8Array))
          return result.err(
            createNatError({
              kind: 'CreateAction.FunctionCall.SerializeArgs.InvalidOutput',
              context: { output },
            }),
          );
        return result.ok(output);
      },
    )();
  }

  // If a user use a default serializer and pass some functionArgs -
  // functionArgs should be a valid JSON object;
  if (args?.functionArgs) {
    const jsonArgs = JsonSchema.safeParse(args.functionArgs);

    if (!jsonArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateAction.FunctionCall.Args.InvalidSchema',
          context: { zodError: jsonArgs.error },
        }),
      );

    return result.ok(toJsonBytes(args.functionArgs));
  }

  // If no functionArgs and serializeArgs - return placeholder;
  return result.ok(new Uint8Array());
};

export const CreateFunctionCallActionArgsSchema = z.object({
  functionName: ContractFunctionNameSchema,
  functionArgs: z.optional(z.unknown()),
  gasLimit: NearGasArgsSchema,
  attachedDeposit: z.optional(NearTokenArgsSchema),
  options: z.optional(
    z.object({
      serializeArgs: z.optional(z.instanceof(Function)),
    }),
  ),
});

export const safeFunctionCall: SafeCreateFunctionCallAction = wrapInternalError(
  'CreateAction.FunctionCall.Internal',
  (args: InnerCreateFunctionCallActionArgs) => {
    const validArgs = CreateFunctionCallActionArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateAction.FunctionCall.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    const functionArgs = serializeFunctionArgs(args);
    if (!functionArgs.ok) return functionArgs;

    return result.ok({
      actionType: 'FunctionCall' as const,
      functionName: args.functionName,
      gasLimit: args.gasLimit,
      functionArgs: functionArgs.value,
      attachedDeposit: args.attachedDeposit,
    });
  },
);

export const throwableFunctionCall: CreateFunctionCallAction = asThrowable(
  safeFunctionCall as any,
) as any; // TODO fix any
