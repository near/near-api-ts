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
  TransactionExecutionStatus,
} from 'nat-types/transaction';

const toNativeAction = (action: Action): NativeAction => {
  if (action.actionType === 'Transfer') return toNativeTransferAction(action);
  if (action.actionType === 'CreateAccount')
    return toNativeCreateAccountAction();
  if (action.actionType === 'AddKey') return toNativeAddKeyAction(action);
  if (action.actionType === 'DeployContract')
    return toNativeDeployContractAction(action);
  if (action.actionType === 'FunctionCall')
    return toNativeFunctionCallAction(action);
  if (action.actionType === 'DeleteKey') return toNativeDeleteKeyAction(action);
  if (action.actionType === 'DeleteAccount')
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

const TransactionExecutionStatusMap = {
  None: 'NONE',
  Included: 'INCLUDED',
  ExecutedOptimistic: 'EXECUTED_OPTIMISTIC',
  IncludedFinal: 'INCLUDED_FINAL',
  Executed: 'EXECUTED',
  Final: 'FINAL',
} as const;

export const toNativeTransactionExecutionStatus = (
  status: TransactionExecutionStatus,
) => TransactionExecutionStatusMap[status];
