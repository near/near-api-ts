import type { NearcoreCallContractFunctionAction } from '../../../../../../types/_common/transaction/actions/delegableActions/callContractFunction';
import type { DelegableAction } from '../../../../../../types/_common/transaction/actions/executeDelegation/delegation';

export const fromNearcoreCallContractFunctionAction = ({
  methodName,
  args,
  gas,
  deposit,
}: NearcoreCallContractFunctionAction['functionCall']): DelegableAction => ({
  actionType: 'CallContractFunction',
  functionName: methodName,
  functionArgs: Uint8Array.from(args),
  gasLimit: { gas },
  attachedDeposit: deposit > 0n ? { yoctoNear: deposit } : undefined,
});
