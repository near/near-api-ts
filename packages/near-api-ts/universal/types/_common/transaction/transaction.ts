import type { AccountId, BlockHash, CryptoHash, Nonce } from '../common';
import type {
  NativePublicKey,
  NativeSignature,
  PublicKey,
  Signature,
} from '../crypto';
import type {
  CreateAccountAction,
  NativeCreateAccountAction,
} from '../../actions/createAccount';
import type {
  NativeTransferAction,
  TransferAction,
} from '../../actions/transfer';
import type {
  AddFullAccessKeyAction,
  AddFunctionCallKeyAction,
  NativeAddKeyAction,
} from '../../actions/addKey';
import type {
  FunctionCallAction,
  NativeFunctionCallAction,
} from '../../actions/functionCall';
import type {
  DeleteKeyAction,
  NativeDeleteKeyAction,
} from '../../actions/deleteKey';
import type {
  DeleteAccountAction,
  NativeDeleteAccountAction,
} from '../../actions/deleteAccount';
import type {
  DeployContractAction,
  NativeDeployContractAction,
} from '../../actions/deployContract';
import type { NativeStakeAction, StakeAction } from '../../actions/stake';

export type Action =
  | CreateAccountAction
  | TransferAction
  | AddFullAccessKeyAction
  | AddFunctionCallKeyAction
  | DeployContractAction
  | FunctionCallAction
  | StakeAction
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
  | NativeStakeAction
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
