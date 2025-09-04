import type {
  FunctionCallAction,
  NativeFunctionCallAction,
} from 'nat-types/actions/functionCall';
import { fromNearOption } from '../../../../helpers/near';
import { fromGasOption } from '../../../../helpers/gas';
import { toContractFnArgsBytes } from '@common/transformers/contract';

export const toNativeFunctionCallAction = (
  action: FunctionCallAction<object>,
): NativeFunctionCallAction => {
  const { fnName, attachedDeposit, gasLimit } = action.params;
  return {
    functionCall: {
      methodName: fnName,
      args: toContractFnArgsBytes(action.params),
      gas: fromGasOption(gasLimit).gas,
      deposit: attachedDeposit ? fromNearOption(attachedDeposit).yoctoNear : 0n,
    },
  };
};
