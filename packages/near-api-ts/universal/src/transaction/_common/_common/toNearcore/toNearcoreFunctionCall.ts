import type { NearcoreFunctionCallAction } from '../../../../../types/_common/transaction/actions/delegableActions/functionCall';
import { nearGas } from '../../../../_common/nearGas';
import { nearToken } from '../../../../_common/nearToken';
import type { InnerFunctionCallAction } from '../zodSchemas/functionCall';

export const toNearcoreFunctionCallAction = (
  action: InnerFunctionCallAction,
): NearcoreFunctionCallAction => {
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
