import type { Prettify } from '../../../../utils';
import type { AccountId, Base64String, BlockHash, BlockHeight, TransactionNonce } from '../../../common';
import type { PublicKey, Signature } from '../../../crypto';
import type { AddFullAccessKeyAction, AddFunctionCallKeyAction } from '../nonDelegateActions/addKey';
import type { CreateAccountAction } from '../nonDelegateActions/createAccount';
import type { DeleteAccountAction } from '../nonDelegateActions/deleteAccount';
import type { DeleteKeyAction } from '../nonDelegateActions/deleteKey';
import type { DeployContractAction } from '../nonDelegateActions/deployContract';
import type { FunctionCallAction } from '../nonDelegateActions/functionCall';
import type { StakeAction } from '../nonDelegateActions/stake';
import type { TransferAction } from '../nonDelegateActions/transfer';

export type NonDelegateAction =
  | CreateAccountAction
  | TransferAction
  | AddFullAccessKeyAction
  | AddFunctionCallKeyAction
  | DeployContractAction
  | FunctionCallAction
  | StakeAction
  | DeleteKeyAction
  | DeleteAccountAction;

type DelegationActions =
  | { action: NonDelegateAction; actions?: never }
  | { action?: never; actions: NonDelegateAction[] };

type Expiration = { blockHeight: BlockHeight } | { blockOffset: number };

export type DelegationIntent = Prettify<
  { receiverAccountId: AccountId; expiration: Expiration } & DelegationActions
>;

type DelegationBase = {
  senderAccountId: AccountId;
  senderPublicKey: PublicKey;
  receiverAccountId: AccountId;
  nonce: TransactionNonce;
  blockHash: BlockHash;
  expiration: Expiration;
};

export type Delegation = Prettify<DelegationBase & DelegationActions>;

export type SignedDelegation = {
  delegation: Delegation;
  signature: Signature;
  signedDelegationBorsh64: Base64String;
};
