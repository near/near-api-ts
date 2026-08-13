import type { Prettify } from '../../utils';
import type { AccountId, Base64String, BlockHash, CryptoHash, TransactionNonce } from '../common';
import type { NearcorePublicKey, NearcoreSignature, PublicKey, Signature } from '../crypto';
import type {
  AddFullAccessKeyAction,
  AddFunctionCallKeyAction,
  NearcoreAddKeyAction,
} from './actions/nonDelegateActions/addKey';
import type {
  CreateAccountAction,
  NearcoreCreateAccountAction,
} from './actions/nonDelegateActions/createAccount';
import type {
  DeleteAccountAction,
  NearcoreDeleteAccountAction,
} from './actions/nonDelegateActions/deleteAccount';
import type {
  DeleteKeyAction,
  NearcoreDeleteKeyAction,
} from './actions/nonDelegateActions/deleteKey';
import type {
  DeployContractAction,
  NearcoreDeployContractAction,
} from './actions/nonDelegateActions/deployContract';
import type {
  FunctionCallAction,
  NearcoreFunctionCallAction,
} from './actions/nonDelegateActions/functionCall';
import type { NearcoreStakeAction, StakeAction } from './actions/nonDelegateActions/stake';
import type { NearcoreTransferAction, TransferAction } from './actions/nonDelegateActions/transfer';

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

// Nearcore Transaction

export type NearcoreAction =
  | NearcoreCreateAccountAction
  | NearcoreTransferAction
  | NearcoreAddKeyAction
  | NearcoreDeployContractAction
  | NearcoreFunctionCallAction
  | NearcoreStakeAction
  | NearcoreDeleteKeyAction
  | NearcoreDeleteAccountAction;

export type NearcoreTransaction = {
  signerId: AccountId;
  publicKey: NearcorePublicKey;
  actions: NearcoreAction[];
  receiverId: AccountId;
  nonce: bigint;
  blockHash: Uint8Array;
};

export type NearcoreSignedTransaction = {
  transaction: NearcoreTransaction;
  signature: NearcoreSignature;
};
