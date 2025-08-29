import type { TransactionIntent } from 'nat-types/transaction';
import type { FunctionCallAction } from 'nat-types/actions/functionCall';
import type { AccountId } from 'nat-types/common';

/**
 * We always want to sign txns with FA key when possible and use FC only if all
 * FA keys are busy/non-present
 */
  // TODO #1: Find all FC keys which can sign the task, not only 1.
  // TODO #2: Add ability to define the keyType priority by user himself.
  //   For example ['FunctionCall', 'FullAccess']
const getPriorityForFunctionCallTransaction = (
  action: FunctionCallAction<object>,
  receiverAccountId: AccountId,
) => [
  { type: 'FullAccess' },
  {
    type: 'FunctionCall',
    contractAccountId: receiverAccountId,
    calledFnName: action.params.fnName,
  },
];

export const getSigningKeyPriority = ({
  action,
  actions,
  receiverAccountId,
}: TransactionIntent) => {
  // If a tx has only 1 FC action - it's possible to sign it with FC
  // (if present/ meet requirements)
  if (action?.type === 'FunctionCall')
    return getPriorityForFunctionCallTransaction(action, receiverAccountId);

  if (actions?.length === 1 && actions[0].type === 'FunctionCall')
    return getPriorityForFunctionCallTransaction(actions[0], receiverAccountId);

  // For everything else use FA key only
  return [{ type: 'FullAccess' }];
};
