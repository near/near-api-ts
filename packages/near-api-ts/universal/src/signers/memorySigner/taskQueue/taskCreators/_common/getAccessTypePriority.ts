import type { TransactionIntent } from '../../../../../../types/transaction';
import type { FunctionCallAction } from '../../../../../../types/actions/functionCall';
import type { AccountId } from '../../../../../../types/_common/common';
import type { AccessTypePriority } from '../../../../../../types/signers/memorySigner/taskQueue';

/**
 * We always want to sign txns with FA key when possible and use FC only if all
 * FA keys are busy/non-present
 */
const getPriorityForFunctionCallTransaction = (
  action: FunctionCallAction,
  receiverAccountId: AccountId,
): AccessTypePriority => [
  { accessType: 'FullAccess' },
  {
    accessType: 'FunctionCall',
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
  if (action?.actionType === 'FunctionCall')
    return getPriorityForFunctionCallTransaction(action, receiverAccountId);

  if (actions?.length === 1 && actions[0].actionType === 'FunctionCall')
    return getPriorityForFunctionCallTransaction(actions[0], receiverAccountId);

  // For everything else use FA key only
  return [{ accessType: 'FullAccess' }];
};
