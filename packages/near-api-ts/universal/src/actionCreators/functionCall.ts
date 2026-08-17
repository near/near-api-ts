import * as z from 'zod/mini';
import type { Result } from '../../types/_common/common';
import type {
  CreateFunctionCallAction,
  InnerCreateFunctionCallActionArgs,
  SafeCreateFunctionCallAction,
} from '../../types/_common/transaction/actions/delegableActions/functionCall';
import { createNatError, NatError } from '../_common/_common/_common/_common/natError';
import { result } from '../_common/_common/_common/result';
import { asThrowable } from '../_common/_common/asThrowable';
import { wrapInternalError } from '../_common/_common/wrapInternalError';
import { ContractFunctionNameZodSchema } from '../_common/_common/zodSchemas/contractFunctionName';
import { NearGasArgsZodSchema } from '../_common/_common/zodSchemas/nearGas';
import { NearTokenArgsZodSchema } from '../_common/_common/zodSchemas/nearToken';
import { convertObjectToU8 } from '../_common/convertObjectToU8';
import { JsonValueZodSchema } from '../_common/zodSchemas/jsonValue';

const serializeFunctionArgs = (
  args: InnerCreateFunctionCallActionArgs,
): Result<
  Uint8Array,
  | NatError<'CreateAction.FunctionCall.SerializeArgs.InvalidOutput'>
  | NatError<'CreateAction.FunctionCall.SerializeArgs.Failed'>
  | NatError<'CreateAction.FunctionCall.Args.InvalidSchema'>
> => {
  // If a user wants to use his own custom serializer;
  if (args.options?.serializeArgs) {
    try {
      // We can't be sure that serializeArgs will really return Uint8Array;
      const output: unknown = args.options.serializeArgs({
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

      // If all ok - return Uint8Array;
      return result.ok(output);
    } catch (e) {
      return result.err(
        createNatError({
          kind: 'CreateAction.FunctionCall.SerializeArgs.Failed',
          context: { cause: e, functionArgs: args.functionArgs },
        }),
      );
    }
  }

  // If a user uses a default serializer and passes some functionArgs -
  // functionArgs should be a valid JSON object;
  if (args?.functionArgs) {
    const jsonArgs = JsonValueZodSchema.safeParse(args.functionArgs);

    if (!jsonArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateAction.FunctionCall.Args.InvalidSchema',
          context: { zodError: jsonArgs.error },
        }),
      );

    return result.ok(convertObjectToU8(args.functionArgs));
  }

  // If no functionArgs and serializeArgs - return placeholder;
  return result.ok(new Uint8Array());
};

export const CreateFunctionCallActionArgsSchema = z.object({
  functionName: ContractFunctionNameZodSchema,
  functionArgs: z.optional(z.unknown()),
  gasLimit: NearGasArgsZodSchema,
  attachedDeposit: z.optional(NearTokenArgsZodSchema),
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
