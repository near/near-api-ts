import type { Action, NativeAction, Transaction } from 'nat-types/transaction';
import { transfer } from '@common/transformers/borsh/nativeActions/transfer';
import { addKey } from '@common/transformers/borsh/nativeActions/addKey';
import { createAccount } from '@common/transformers/borsh/nativeActions/createAccount';
import { functionCall } from '@common/transformers/borsh/nativeActions/functionCall';
import { deleteKey } from '@common/transformers/borsh/nativeActions/deleteKey';
import { deleteAccount } from '@common/transformers/borsh/nativeActions/deleteAccount';

const toNativeAction = (action: Action): NativeAction => {
  if (action.type === 'Transfer') return transfer(action);
  if (action.type === 'CreateAccount') return createAccount();
  if (action.type === 'AddKey') return addKey(action);
  if (action.type === 'FunctionCall') return functionCall(action);
  if (action.type === 'DeleteKey') return deleteKey(action);
  if (action.type === 'DeleteAccount') return deleteAccount(action);
  throw new Error('Invalid action type');
};

export const toNativeActions = (transaction: Transaction) => {
  if (transaction.action) return [toNativeAction(transaction.action)];

  if (transaction.actions)
    return transaction.actions.map((action) => toNativeAction(action));

  return [];
};
