import type { NearcoreFunctionCallAction } from '../../../../../../types/_common/transaction/actions/delegableActions/functionCall';
import type { DelegableAction } from '../../../../../../types/_common/transaction/actions/executeDelegation/delegation';

export const fromNearcoreFunctionCallAction = ({
  methodName,
  args,
  gas,
  deposit,
}: NearcoreFunctionCallAction['functionCall']): DelegableAction => ({
  actionType: 'FunctionCall',
  functionName: methodName,
  functionArgs: Uint8Array.from(args),
  gasLimit: { gas },
  attachedDeposit: deposit > 0n ? { yoctoNear: deposit } : undefined,
});
