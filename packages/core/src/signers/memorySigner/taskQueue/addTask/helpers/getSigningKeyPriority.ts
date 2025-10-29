import type { TransactionIntent } from 'nat-types/transaction';
import type { FunctionCallAction } from 'nat-types/actions/functionCall';
import type { AccountId } from 'nat-types/common';
import type { SigningKeyPriority } from 'nat-types/signers/taskQueue';

/**
 * We always want to sign txns with FA key when possible and use FC only if all
 * FA keys are busy/non-present
 */
const getPriorityForFunctionCallTransaction = (
  action: FunctionCallAction,
  receiverAccountId: AccountId,
): SigningKeyPriority => [
  { accessType: 'FullAccess' },
  {
    accessType: 'FunctionCall',
    contractAccountId: receiverAccountId,
    calledFnName: action.functionName,
  },
];

export const getSigningKeyPriority = ({
  action,
  actions,
  receiverAccountId,
}: TransactionIntent): SigningKeyPriority => {
  // If a tx has only 1 FC action - it's possible to sign it with FC
  // (if present/ meet requirements)
  if (action?.actionType === 'FunctionCall')
    return getPriorityForFunctionCallTransaction(action, receiverAccountId);

  if (actions?.length === 1 && actions[0].actionType === 'FunctionCall')
    return getPriorityForFunctionCallTransaction(actions[0], receiverAccountId);

  // For everything else use FA key only
  return [{ accessType: 'FullAccess' }];
};
