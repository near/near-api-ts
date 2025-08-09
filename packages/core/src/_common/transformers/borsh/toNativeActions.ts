import type { Action, NativeAction, Transaction } from 'nat-types/transaction';
import { transfer } from '@common/transformers/borsh/nativeActions/transfer';
import { addKey } from '@common/transformers/borsh/nativeActions/addKey';
import { createAccount } from '@common/transformers/borsh/nativeActions/createAccount';

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
