import type { Prettify } from '../../utils';
import type { AccountId, Base64String, BlockHash, CryptoHash, TransactionNonce } from '../common';
import type { NearcorePublicKey, NearcoreSignature, PublicKey, Signature } from '../crypto';
import type {
  AddFullAccessKeyAction,
  AddFunctionCallKeyAction,
  NearcoreAddKeyAction,
} from './actions/delegableActions/addKey';
import type {
  CreateAccountAction,
  NearcoreCreateAccountAction,
} from './actions/delegableActions/createAccount';
import type {
  DeleteAccountAction,
  NearcoreDeleteAccountAction,
} from './actions/delegableActions/deleteAccount';
import type {
  DeleteKeyAction,
  NearcoreDeleteKeyAction,
} from './actions/delegableActions/deleteKey';
import type {
  DeployContractAction,
  NearcoreDeployContractAction,
} from './actions/delegableActions/deployContract';
import type {
  FunctionCallAction,
  NearcoreFunctionCallAction,
} from './actions/delegableActions/functionCall';
import type { NearcoreStakeAction, StakeAction } from './actions/delegableActions/stake';
import type { NearcoreTransferAction, TransferAction } from './actions/delegableActions/transfer';
import type {
  ExecuteDelegationAction,
  NearcoreExecuteDelegationAction,
} from './actions/executeDelegation/executeDelegation';

export type TransactionAction =
  | CreateAccountAction
  | TransferAction
  | AddFullAccessKeyAction
  | AddFunctionCallKeyAction
  | DeployContractAction
  | FunctionCallAction
  | StakeAction
  | DeleteKeyAction
  | DeleteAccountAction
  | ExecuteDelegationAction;

type SingleTransactionAction = { action: TransactionAction; actions?: never };
type MultiTransactionActions = { action?: never; actions: TransactionAction[] };

type TransactionBase = {
  signerAccountId: AccountId;
  signerPublicKey: PublicKey;
  receiverAccountId: AccountId;
  nonce: TransactionNonce;
  blockHash: BlockHash;
};

type SingleActionTransaction = TransactionBase & SingleTransactionAction;
type MultiActionsTransaction = TransactionBase & MultiTransactionActions;

export type Transaction = SingleActionTransaction | MultiActionsTransaction;

export type TransactionIntent = Prettify<
  {
    receiverAccountId: AccountId;
  } & (SingleTransactionAction | MultiTransactionActions)
>;

export type SignedTransaction = {
  transactionHash: CryptoHash;
  transaction: Transaction;
  signature: Signature;
  signedTransactionBorsh64: Base64String;
};

// Nearcore Transaction

export type NearcoreTransactionAction =
  | NearcoreCreateAccountAction
  | NearcoreTransferAction
  | NearcoreAddKeyAction
  | NearcoreDeployContractAction
  | NearcoreFunctionCallAction
  | NearcoreStakeAction
  | NearcoreDeleteKeyAction
  | NearcoreDeleteAccountAction
  | NearcoreExecuteDelegationAction;

export type NearcoreTransaction = {
  signerId: AccountId;
  publicKey: NearcorePublicKey;
  actions: NearcoreTransactionAction[];
  receiverId: AccountId;
  nonce: bigint;
  blockHash: Uint8Array;
};

export type NearcoreSignedTransaction = {
  transaction: NearcoreTransaction;
  signature: NearcoreSignature;
};
