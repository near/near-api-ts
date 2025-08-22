import { fromGasOption } from '../../../../../../helpers/gas';
import { yoctoNear } from '../../../../../../helpers/near';
import type { TransactionIntent } from 'nat-types/transaction';
import type { FunctionCallAction } from 'nat-types/actions/functionCall';
import type { AccountId, NearToken } from 'nat-types/common';

const getRequiredGasBudget = (
  action: FunctionCallAction<object>,
  signerContext: any,
): NearToken => {
  // gasLimit * gasPrice
  const requiredYoctoNearGasBudget =
    fromGasOption(action.params.gasLimit).gas *
    signerContext.state.getGasPrice();

  return yoctoNear(requiredYoctoNearGasBudget);
};

/**
 * We always want to sign txns with FA key when possible and use FC only if all
 * FA keys are busy/non-present
 */
const getPriorityForFunctionCallTransaction = (
  action: FunctionCallAction<object>,
  receiverAccountId: AccountId,
  signerContext: any,
) => [
  { type: 'FullAccess' },
  {
    type: 'FunctionCall',
    contractAccountId: receiverAccountId,
    calledFnName: action.params.fnName,
    requiredGasBudget: getRequiredGasBudget(action, signerContext),
  },
];

export const getSigningKeyPriority = (
  { action, actions, receiverAccountId }: TransactionIntent,
  signerContext: any,
) => {
  // If a tx has only 1 FC action - it's possible to sign it with FC
  // (if present/ meet requirements)
  if (action?.type === 'FunctionCall')
    return getPriorityForFunctionCallTransaction(
      action,
      receiverAccountId,
      signerContext,
    );

  if (actions?.length === 1 && actions[0].type === 'FunctionCall')
    return getPriorityForFunctionCallTransaction(
      actions[0],
      receiverAccountId,
      signerContext,
    );

  // For everything else use FA key only
  return [{ type: 'FullAccess' }];
};
