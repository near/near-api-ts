import type { NativeFunctionCallAction } from '../../../../../types/_common/transaction/actions/functionCall';
import { throwableNearGas } from '../../../../helpers/nearGas';
import { nearToken } from '../../../../helpers/tokens/nearToken';
import type { InnerFunctionCallAction } from '../../../schemas/zod/transaction/actions/functionCall';

export const toNativeFunctionCallAction = (
  action: InnerFunctionCallAction,
): NativeFunctionCallAction => {
  const { functionName, attachedDeposit, gasLimit, functionArgs } = action;
  return {
    functionCall: {
      methodName: functionName,
      args: functionArgs,
      gas: throwableNearGas(gasLimit).gas,
      deposit: attachedDeposit ? nearToken(attachedDeposit).yoctoNear : 0n,
    },
  };
};
