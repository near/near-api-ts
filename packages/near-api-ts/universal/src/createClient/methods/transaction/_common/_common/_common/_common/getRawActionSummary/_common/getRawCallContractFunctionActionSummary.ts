import type { FunctionCallAction } from '@near-js/jsonrpc-types';
import { gas } from '../../../../../../../../../_common/nearGas';
import { yoctoNear } from '../../../../../../../../../_common/nearToken';

export const getRawCallContractFunctionActionSummary = ({
  methodName,
  args,
  gas: gasLimit,
  deposit,
}: FunctionCallAction) => ({
  actionType: 'CallContractFunction' as const,
  functionName: methodName,
  functionArgs: args,
  gasLimit: gas(gasLimit),
  attachedDeposit: yoctoNear(deposit),
});
