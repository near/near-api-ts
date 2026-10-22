import type { NearcoreCallContractFunctionAction } from '../../../../../types/_common/transaction/actions/delegableActions/callContractFunction';
import { nearGas } from '../../../../_common/nearGas';
import { nearToken } from '../../../../_common/nearToken';
import type { InnerCallContractFunctionAction } from '../zodSchemas/callContractFunction';

export const toNearcoreCallContractFunctionAction = (
  action: InnerCallContractFunctionAction,
): NearcoreCallContractFunctionAction => {
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
