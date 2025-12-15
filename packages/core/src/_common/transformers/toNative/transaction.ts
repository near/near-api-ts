import { toNativePublicKey } from '@common/transformers/toNative/publicKey';
import { toNativeTransferAction } from '@common/transformers/toNative/actions/transfer';
import { toNativeCreateAccountAction } from '@common/transformers/toNative/actions/createAccount';
import { toNativeAddKeyAction } from '@common/transformers/toNative/actions/addKey';
import { toNativeDeployContractAction } from '@common/transformers/toNative/actions/deployContract';
import { toNativeFunctionCallAction } from '@common/transformers/toNative/actions/functionCall';
import { toNativeDeleteKeyAction } from '@common/transformers/toNative/actions/deleteKey';
import { toNativeDeleteAccountAction } from '@common/transformers/toNative/actions/deleteAccount';
import type {
  NativeAction,
  NativeSignedTransaction,
  NativeTransaction,
} from 'nat-types/transaction';
import type {
  InnerAction,
  InnerSignedTransaction,
  InnerTransaction,
} from '@common/schemas/zod/transaction/transaction';
import { toNativeSignature } from '@common/transformers/toNative/signature';

// biome-ignore format: keep compact
const toNativeAction = (action: InnerAction): NativeAction => {
  if (action.actionType === 'Transfer') return toNativeTransferAction(action);
  if (action.actionType === 'CreateAccount') return toNativeCreateAccountAction();
  if (action.actionType === 'AddKey') return toNativeAddKeyAction(action);
  if (action.actionType === 'DeployContract') return toNativeDeployContractAction(action);
  if (action.actionType === 'FunctionCall') return toNativeFunctionCallAction(action);
  if (action.actionType === 'DeleteKey') return toNativeDeleteKeyAction(action);
  // the last action type could only be a DeleteAccount
  return toNativeDeleteAccountAction(action);
};

const toNativeActions = (transaction: InnerTransaction) => {
  if (transaction.action) return [toNativeAction(transaction.action)];

  if (transaction.actions)
    return transaction.actions.map((action) => toNativeAction(action));

  return [];
};

export const toNativeTransaction = (
  transaction: InnerTransaction,
): NativeTransaction => ({
  signerId: transaction.signerAccountId,
  publicKey: toNativePublicKey(transaction.signerPublicKey),
  actions: toNativeActions(transaction),
  receiverId: transaction.receiverAccountId,
  nonce: BigInt(transaction.nonce),
  blockHash: transaction.blockHash.u8CryptoHash,
});

export const toNativeSignedTransaction = (
  signedTransaction: InnerSignedTransaction,
): NativeSignedTransaction => ({
  transaction: toNativeTransaction(signedTransaction.transaction),
  signature: toNativeSignature(signedTransaction.signature),
});
