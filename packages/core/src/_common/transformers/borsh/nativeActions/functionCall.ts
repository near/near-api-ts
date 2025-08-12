import type {
  FunctionCallAction,
  NativeFunctionCallAction,
  FunctionCallParams,
} from 'nat-types/actions/functionCall';
import { fromNearOption } from '../../../../helpers/near';
import { fromGasOption } from '../../../../helpers/gas';

const getArgs = (params: FunctionCallParams<object>): Uint8Array => {
  if (params.fnArgsBinary) return params.fnArgsBinary;

  if (params.fnArgsJson)
    return new TextEncoder().encode(JSON.stringify(params.fnArgsJson));

  return new Uint8Array();
};

export const functionCall = (
  action: FunctionCallAction<object>,
): NativeFunctionCallAction => {
  const { fnName, attachedDeposit, gasLimit } = action.params;
  return {
    functionCall: {
      methodName: fnName,
      args: getArgs(action.params),
      gas: fromGasOption(gasLimit).gas,
      deposit: attachedDeposit ? fromNearOption(attachedDeposit).yoctoNear : 0n,
    },
  };
};
