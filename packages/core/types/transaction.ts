import type { AccountId, BlockHash, Nonce } from './common';
import type { PublicKey, NativePublicKey } from './crypto';
import type {
  CreateAccountAction,
  NativeCreateAccountAction,
} from 'nat-types/actions/createAccount';
import type {
  TransferAction,
  NativeTransferAction,
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

export type Action =
  | CreateAccountAction
  | TransferAction
  | AddKeyAction
  | FunctionCallAction<object>
  | DeleteKeyAction;

type SingleAction = { action: Action; actions?: never };
type MultiActions = { action?: never; actions: Action[] };

type TransactionBase = {
  signerAccountId: AccountId;
  signerPublicKey: PublicKey;
  receiverAccountId: AccountId;
  nonce: Nonce;
  blockHash: BlockHash;
};

export type Transaction = TransactionBase & (SingleAction | MultiActions);

export type NativeAction =
  | NativeCreateAccountAction
  | NativeTransferAction
  | NativeAddKeyAction
  | NativeFunctionCallAction
  | NativeDeleteKeyAction;

export type NativeTransaction = {
  signerId: AccountId;
  publicKey: NativePublicKey;
  actions: NativeAction[];
  receiverId: AccountId;
  nonce: bigint;
  blockHash: Uint8Array;
};
