import type {
  CallContractFunctionAction,
  NearcoreCallContractFunctionAction,
} from '../../../../../../types/_common/transaction/actions/delegableActions/callContractFunction';

export const fromNearcoreCallContractFunctionAction = ({
  methodName,
  args,
  gas,
  deposit,
}: NearcoreCallContractFunctionAction['functionCall']): CallContractFunctionAction => ({
  actionType: 'CallContractFunction',
  functionName: methodName,
  functionArgs: Uint8Array.from(args),
  gasLimit: { gas },
  attachedDeposit: deposit > 0n ? { yoctoNear: deposit } : undefined,
});
