import type { AccountId } from '../../../../../types/_common/common';
import type { CallContractFunctionAction } from '../../../../../types/_common/transaction/actions/delegableActions/callContractFunction';
import type { TransactionIntent } from '../../../../../types/_common/transaction/transaction';
import type { AccessTypePriority } from '../../../../../types/signer/inner/taskQueue';

/**
 * We always want to sign txns with FA key when possible and use FC only if all
 * FA keys are busy/non-present
 */
const getPriorityForCallContractFunctionTransaction = (
  action: CallContractFunctionAction,
  receiverAccountId: AccountId,
): AccessTypePriority => [
  { accessType: 'FullAccess' },
  {
    accessType: 'ContractFunctionCall',
    contractAccountId: receiverAccountId,
    calledFnName: action.functionName,
  },
];

export const getAccessTypePriority = ({
  action,
  actions,
  receiverAccountId,
}: TransactionIntent): AccessTypePriority => {
  // If a tx has only 1 FC action - it's possible to sign it with FC
  // (if present/ meet requirements)
  // TODO check a case with attachedDeposit
  if (action?.actionType === 'CallContractFunction')
    return getPriorityForCallContractFunctionTransaction(action, receiverAccountId);

  if (actions?.length === 1 && actions[0].actionType === 'CallContractFunction')
    return getPriorityForCallContractFunctionTransaction(actions[0], receiverAccountId);

  // For everything else use FA key only
  return [{ accessType: 'FullAccess' }];
};
