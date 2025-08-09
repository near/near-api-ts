import type { Action, NativeAction, Transaction } from 'nat-types/transaction';
import { transfer } from './transfer';
import { addKey } from './addKey';
import { createAccount } from './createAccount';
// import type {
//   TransferAction,
//   CreateAccountAction,
// } from 'nat-types/actions';
//
// const getBorshTransferAction = (action: TransferAction) => ({
//   transfer: {
//     deposit: action.params.amount.yoctoNear,
//   },
// });

const toBorshAction = (action: Action): NativeAction => {
  if (action.type === 'Transfer') return transfer(action);
  if (action.type === 'CreateAccount') return createAccount();
  // if (action.type === 'AddKey') return addKey(action);
  throw new Error('Not implemented.');
};

export const toNativeActions = (transaction: Transaction) => {
  if (transaction.action) return [toBorshAction(transaction.action)];

  if (transaction.actions)
    return transaction.actions.map((action) => toBorshAction(action));

  return [];
};
