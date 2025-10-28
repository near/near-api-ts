import type {
  FunctionCallAction,
  NativeFunctionCallAction,
} from 'nat-types/actions/functionCall';
import { fromNearOption } from '../../../../helpers/near';
import { fromGasOption } from '../../../../helpers/gas';

export const toNativeFunctionCallAction = (
  action: FunctionCallAction,
): NativeFunctionCallAction => {
  const { functionName, attachedDeposit, gasLimit, functionArgs } = action;
  return {
    functionCall: {
      methodName: functionName,
      args: functionArgs,
      gas: fromGasOption(gasLimit).gas,
      deposit: attachedDeposit ? fromNearOption(attachedDeposit).yoctoNear : 0n,
    },
  };
};
