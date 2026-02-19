import type { NativeAction, NativeSignedTransaction, NativeTransaction } from '@universal/types/_common/transaction/transaction';
import type { InnerAction, InnerSignedTransaction, InnerTransaction } from '../../schemas/zod/transaction/transaction';
import { toNativeAddKeyAction } from './actions/addKey';
import { toNativeCreateAccountAction } from './actions/createAccount';
import { toNativeDeleteAccountAction } from './actions/deleteAccount';
import { toNativeDeleteKeyAction } from './actions/deleteKey';
import { toNativeDeployContractAction } from './actions/deployContract';
import { toNativeFunctionCallAction } from './actions/functionCall';
import { toNativeStakeAction } from './actions/stake';
import { toNativeTransferAction } from './actions/transfer';
import { toNativePublicKey } from './publicKey';
import { toNativeSignature } from './signature';

// biome-ignore format: keep compact
const toNativeAction = (action: InnerAction): NativeAction => {
  if (action.actionType === 'Transfer') return toNativeTransferAction(action);
  if (action.actionType === 'CreateAccount') return toNativeCreateAccountAction();
  if (action.actionType === 'AddKey') return toNativeAddKeyAction(action);
  if (action.actionType === 'DeployContract') return toNativeDeployContractAction(action);
  if (action.actionType === 'Stake') return toNativeStakeAction(action);
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
