import type { NativeFunctionCallAction } from '@universal/types/actions/functionCall';
import { throwableNearGas } from '../../../../helpers/nearGas';
import { throwableNearToken } from '../../../../helpers/tokens/nearToken';
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
      deposit: attachedDeposit
        ? throwableNearToken(attachedDeposit).yoctoNear
        : 0n,
    },
  };
};
