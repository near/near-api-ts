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

export type Action = CreateAccountAction | TransferAction | AddKeyAction;

type TransactionBase = {
  signerAccountId: AccountId;
  signerPublicKey: PublicKey;
  receiverAccountId: AccountId;
  nonce: Nonce;
  blockHash: BlockHash;
};

type SingleAction = { action: Action; actions?: never };
type MultiActions = { action?: never; actions: Action[] };

export type Transaction = TransactionBase & (SingleAction | MultiActions);

export type NativeAction =
  | NativeCreateAccountAction
  | NativeTransferAction
  | NativeAddKeyAction;

export type NativeTransaction = {
  signerId: AccountId;
  publicKey: NativePublicKey;
  actions: NativeAction[];
  receiverId: AccountId;
  nonce: bigint;
  blockHash: Uint8Array;
};
