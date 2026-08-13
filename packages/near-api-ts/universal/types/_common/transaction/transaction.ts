import type { Prettify } from '../../utils';
import type { AccountId, Base64String, BlockHash, CryptoHash, TransactionNonce } from '../common';
import type { NativePublicKey, NativeSignature, PublicKey, Signature } from '../crypto';
import type {
  AddFullAccessKeyAction,
  AddFunctionCallKeyAction,
  NativeAddKeyAction,
} from './actions/nonDelegateActions/addKey';
import type { CreateAccountAction, NativeCreateAccountAction } from './actions/nonDelegateActions/createAccount';
import type { DeleteAccountAction, NativeDeleteAccountAction } from './actions/nonDelegateActions/deleteAccount';
import type { DeleteKeyAction, NativeDeleteKeyAction } from './actions/nonDelegateActions/deleteKey';
import type { DeployContractAction, NativeDeployContractAction } from './actions/nonDelegateActions/deployContract';
import type { FunctionCallAction, NativeFunctionCallAction } from './actions/nonDelegateActions/functionCall';
import type { NativeStakeAction, StakeAction } from './actions/nonDelegateActions/stake';
import type { NativeTransferAction, TransferAction } from './actions/nonDelegateActions/transfer';

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
  nonce: TransactionNonce;
  blockHash: BlockHash;
};

type SingleActionTransaction = TransactionBase & SingleAction;
type MultiActionsTransaction = TransactionBase & MultiActions;

export type Transaction = SingleActionTransaction | MultiActionsTransaction;

export type TransactionIntent = Prettify<
  {
    receiverAccountId: AccountId;
  } & (SingleAction | MultiActions)
>;

export type SignedTransaction = {
  transactionHash: CryptoHash;
  transaction: Transaction;
  signature: Signature;
  signedTransactionBorsh64: Base64String;
};

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

export type NativeSignedTransaction = {
  transaction: NativeTransaction;
  signature: NativeSignature;
};
