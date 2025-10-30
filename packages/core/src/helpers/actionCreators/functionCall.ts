import type {
  CreateFunctionCallAction,
  InnerCreateFunctionCallActionArgs,
} from 'nat-types/actions/functionCall';
import { toJsonBytes } from '@common/utils/common';

const serializeFunctionArgs = (args: InnerCreateFunctionCallActionArgs) => {
  if (args?.options?.serializeArgs)
    return args.options.serializeArgs({ functionArgs: args.functionArgs });

  if (args?.functionArgs) return toJsonBytes(args?.functionArgs);

  return new Uint8Array();
};

export const functionCall: CreateFunctionCallAction = (
  args: InnerCreateFunctionCallActionArgs,
) => ({
  actionType: 'FunctionCall' as const,
  functionName: args.functionName,
  gasLimit: args.gasLimit,
  functionArgs: serializeFunctionArgs(args),
  attachedDeposit: args.attachedDeposit,
});
