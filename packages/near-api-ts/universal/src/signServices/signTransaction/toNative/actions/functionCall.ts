import type { NativeFunctionCallAction } from '../../../../../types/_common/transaction/actions/nonDelegateActions/functionCall';
import { nearGas } from '../../../../_common/nearGas';
import { nearToken } from '../../../../_common/nearToken';
import type { InnerFunctionCallAction } from '../../zodSchemas/actions/functionCall';

export const toNativeFunctionCallAction = (
  action: InnerFunctionCallAction,
): NativeFunctionCallAction => {
  const { functionName, attachedDeposit, gasLimit, functionArgs } = action;
  return {
    functionCall: {
      methodName: functionName,
      args: functionArgs,
      gas: nearGas(gasLimit).gas,
      deposit: attachedDeposit ? nearToken(attachedDeposit).yoctoNear : 0n,
    },
  };
};
