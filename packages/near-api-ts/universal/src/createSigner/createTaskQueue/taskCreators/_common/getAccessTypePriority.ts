import type { AccountId } from '../../../../../types/_common/common';
import type { CallContractFunctionAction } from '../../../../../types/_common/transaction/actions/delegableActions/callContractFunction';
import type { TransactionAction } from '../../../../../types/_common/transaction/transaction';
import type { AccessTypePriority } from '../../../../../types/signer/inner/taskQueue';
import { nearToken } from '../../../../_common/nearToken';

// The action(s) of a transaction, or the delegated action(s) of a delegation - nearcore checks
// either against an FC key the same way
type GetAccessTypePriorityArgs = {
  action?: TransactionAction;
  actions?: TransactionAction[];
  receiverAccountId: AccountId;
};

/**
 * We always want to sign txns and delegations with FA key when possible and use FC only if all
 * FA keys are busy/non-present. An FC key can't attach a deposit - nearcore refuses such
 * a call with DepositWithFunctionCall - so a call with a deposit takes an FA key only.
 */
const getPriorityForCallContractFunction = (
  action: CallContractFunctionAction,
  receiverAccountId: AccountId,
): AccessTypePriority => {
  if (action.attachedDeposit && nearToken(action.attachedDeposit).yoctoNear > 0n)
    return [{ accessType: 'FullAccess' }];

  return [
    { accessType: 'FullAccess' },
    {
      accessType: 'ContractFunctionCall',
      contractAccountId: receiverAccountId,
      calledFnName: action.functionName,
    },
  ];
};

export const getAccessTypePriority = ({
  action,
  actions,
  receiverAccountId,
}: GetAccessTypePriorityArgs): AccessTypePriority => {
  // If a tx or a delegation has only 1 FC action - it's possible to sign it with FC
  // (if present/ meet requirements)
  if (action?.actionType === 'CallContractFunction')
    return getPriorityForCallContractFunction(action, receiverAccountId);

  if (actions?.length === 1 && actions[0].actionType === 'CallContractFunction')
    return getPriorityForCallContractFunction(actions[0], receiverAccountId);

  // For everything else use FA key only
  return [{ accessType: 'FullAccess' }];
};
