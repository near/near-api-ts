import type {
  FunctionCallAction,
  NativeFunctionCallAction,
} from 'nat-types/actions/functionCall';
import { fromNearOption } from '../../../../helpers/near';
import { fromGasOption } from '../../../../helpers/gas';
import { toContractFnArgsBytes } from '@common/transformers/contract';
import type { MaybeJsonLikeValue } from 'nat-types/common';

export const toNativeFunctionCallAction = <AJ extends MaybeJsonLikeValue>(
  action: FunctionCallAction<AJ>,
): NativeFunctionCallAction => {
  const { functionName, attachedDeposit, gasLimit } = action.params;
  return {
    functionCall: {
      methodName: functionName,
      args: toContractFnArgsBytes(action.params),
      gas: fromGasOption(gasLimit).gas,
      deposit: attachedDeposit ? fromNearOption(attachedDeposit).yoctoNear : 0n,
    },
  };
};
