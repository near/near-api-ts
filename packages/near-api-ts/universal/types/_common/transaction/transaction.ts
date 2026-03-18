import type { AddFullAccessKeyAction, AddFunctionCallKeyAction, NativeAddKeyAction } from '@universal/types/_common/transaction/actions/addKey';
import type { CreateAccountAction, NativeCreateAccountAction } from '@universal/types/_common/transaction/actions/createAccount';
import type { DeleteAccountAction, NativeDeleteAccountAction } from '@universal/types/_common/transaction/actions/deleteAccount';
import type { DeleteKeyAction, NativeDeleteKeyAction } from '@universal/types/_common/transaction/actions/deleteKey';
import type { DeployContractAction, NativeDeployContractAction } from '@universal/types/_common/transaction/actions/deployContract';
import type { FunctionCallAction, NativeFunctionCallAction } from '@universal/types/_common/transaction/actions/functionCall';
import type { NativeStakeAction, StakeAction } from '@universal/types/_common/transaction/actions/stake';
import type { NativeTransferAction, TransferAction } from '@universal/types/_common/transaction/actions/transfer';
import type { AccountId, BlockHash, CryptoHash, Nonce } from '../common';
import type { NativePublicKey, NativeSignature, PublicKey, Signature } from '../crypto';

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
