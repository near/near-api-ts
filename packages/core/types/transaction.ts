import type { AccountId, BlockHash, CryptoHash, Nonce } from './_common/common';
import type {
  NativePublicKey,
  NativeSignature,
  PublicKey,
  Signature,
} from './_common/crypto';
import type {
  CreateAccountAction,
  NativeCreateAccountAction,
} from 'nat-types/actions/createAccount';
import type {
  NativeTransferAction,
  TransferAction,
} from 'nat-types/actions/transfer';
import type {
  AddKeyAction,
  NativeAddKeyAction,
} from 'nat-types/actions/addKey';
import type {
  FunctionCallAction,
  NativeFunctionCallAction,
} from 'nat-types/actions/functionCall';
import type {
  DeleteKeyAction,
  NativeDeleteKeyAction,
} from 'nat-types/actions/deleteKey';
import type {
  DeleteAccountAction,
  NativeDeleteAccountAction,
} from 'nat-types/actions/deleteAccount';
import type {
  DeployContractAction,
  NativeDeployContractAction,
} from 'nat-types/actions/deployContract';

export type Action =
  | CreateAccountAction
  | TransferAction
  | AddKeyAction
  | DeployContractAction
  | FunctionCallAction
  | DeleteKeyAction
  | DeleteAccountAction;

type SingleAction = { action: Action; actions?: never };
type MultiActions = { action?: never; actions: Action[] };

type TransactionBase = {
  signerAccountId: AccountId;
  signerPublicKey: PublicKey;
  receiverAccountId: AccountId;
  nonce: Nonce;
  blockHash: BlockHash;
};

type SingleActionTransaction = TransactionBase & SingleAction;
type MultiActionsTransaction = TransactionBase & MultiActions;

export type Transaction = SingleActionTransaction | MultiActionsTransaction;

export type TransactionIntent = {
  receiverAccountId: AccountId;
} & (SingleAction | MultiActions);

// Native Transaction

export type NativeAction =
  | NativeCreateAccountAction
  | NativeTransferAction
  | NativeAddKeyAction
  | NativeDeployContractAction
  | NativeFunctionCallAction
  | NativeDeleteKeyAction
  | NativeDeleteAccountAction;

export type NativeTransaction = {
  signerId: AccountId;
  publicKey: NativePublicKey;
  actions: NativeAction[];
  receiverId: AccountId;
  nonce: bigint;
  blockHash: Uint8Array;
};

// Signed Transaction

export type SignedTransaction = {
  transaction: Transaction;
  transactionHash: CryptoHash;
  signature: Signature;
};

export type NativeSignedTransaction = {
  transaction: NativeTransaction;
  signature: NativeSignature;
};

// TODO remove
/**
 *  <h3>Transaction Execution Levels:</h3>
 *
 *  **None**: Transaction is waiting to be included into the block
 *
 *  **Included**: Transaction is included into the block. The block may be not finalized yet
 *
 *  **ExecutedOptimistic**: Transaction is included into the block +
 *  all non-refund transaction receipts finished their execution.
 *  The corresponding blocks for tx and each receipt may be not finalized yet
 *
 *  **IncludedFinal**: Transaction is included into finalized block
 *
 *  **Executed**: Transaction is included into finalized block +
 *  All non-refund transaction receipts finished their execution.
 *  The corresponding blocks for each receipt may be not finalized yet
 *
 *  **Final**: Transaction is included into finalized block +
 *  Execution of all transaction receipts is finalized, including refund receipts
 */
export type TransactionExecutionStatus =
  | 'None'
  | 'Included'
  | 'ExecutedOptimistic'
  | 'IncludedFinal'
  | 'Executed'
  | 'Final';
