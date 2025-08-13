import { base58 } from '@scure/base';
import { toNativePublicKey } from '@common/transformers/toNative/publicKey';
import { toNativeTransferAction } from '@common/transformers/toNative/actions/transfer';
import { toNativeCreateAccountAction } from '@common/transformers/toNative/actions/createAccount';
import { toNativeAddKeyAction } from '@common/transformers/toNative/actions/addKey';
import { toNativeDeployContractAction } from '@common/transformers/toNative/actions/deployContract';
import { toNativeFunctionCallAction } from '@common/transformers/toNative/actions/functionCall';
import { toNativeDeleteKeyAction } from '@common/transformers/toNative/actions/deleteKey';
import { toNativeDeleteAccountAction } from '@common/transformers/toNative/actions/deleteAccount';
import type {
  Action,
  NativeAction,
  NativeTransaction,
  Transaction,
} from 'nat-types/transaction';

const toNativeAction = (action: Action): NativeAction => {
  if (action.type === 'Transfer') return toNativeTransferAction(action);
  if (action.type === 'CreateAccount') return toNativeCreateAccountAction();
  if (action.type === 'AddKey') return toNativeAddKeyAction(action);
  if (action.type === 'DeployContract')
    return toNativeDeployContractAction(action);
  if (action.type === 'FunctionCall') return toNativeFunctionCallAction(action);
  if (action.type === 'DeleteKey') return toNativeDeleteKeyAction(action);
  if (action.type === 'DeleteAccount')
    return toNativeDeleteAccountAction(action);
  throw new Error('Invalid transaction action type');
};

const toNativeActions = (transaction: Transaction) => {
  if (transaction.action) return [toNativeAction(transaction.action)];

  if (transaction.actions)
    return transaction.actions.map((action) => toNativeAction(action));

  return [];
};

export const toNativeTransaction = (
  transaction: Transaction,
): NativeTransaction => ({
  signerId: transaction.signerAccountId,
  publicKey: toNativePublicKey(transaction.signerPublicKey),
  actions: toNativeActions(transaction),
  receiverId: transaction.receiverAccountId,
  nonce: BigInt(transaction.nonce),
  blockHash: base58.decode(transaction.blockHash),
});
