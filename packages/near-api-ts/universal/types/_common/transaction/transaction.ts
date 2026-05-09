import type { Prettify } from '../../utils';
import type { AccountId, BlockHash, CryptoHash, TransactionNonce } from '../common';
import type { NativePublicKey, NativeSignature, PublicKey, Signature } from '../crypto';
import type {
  AddFullAccessKeyAction,
  AddFunctionCallKeyAction,
  NativeAddKeyAction,
} from './actions/addKey';
import type { CreateAccountAction, NativeCreateAccountAction } from './actions/createAccount';
import type { DeleteAccountAction, NativeDeleteAccountAction } from './actions/deleteAccount';
import type { DeleteKeyAction, NativeDeleteKeyAction } from './actions/deleteKey';
import type { DeployContractAction, NativeDeployContractAction } from './actions/deployContract';
import type { FunctionCallAction, NativeFunctionCallAction } from './actions/functionCall';
import type { NativeStakeAction, StakeAction } from './actions/stake';
import type { NativeTransferAction, TransferAction } from './actions/transfer';

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
  transaction: Transaction;
  transactionHash: CryptoHash;
  signature: Signature;
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
