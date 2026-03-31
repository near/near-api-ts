import type { Prettify } from '../../utils';
import type { AccountId, Base64String, BlockHash, BlockHeight, Nonce } from '../common';
import type { PublicKey, Signature } from '../crypto';
import type {
  AddFullAccessKeyAction,
  AddFunctionCallKeyAction,
} from './actions/addKey';
import type { CreateAccountAction } from './actions/createAccount';
import type { DeleteAccountAction } from './actions/deleteAccount';
import type { DeleteKeyAction } from './actions/deleteKey';
import type { DeployContractAction } from './actions/deployContract';
import type { FunctionCallAction } from './actions/functionCall';
import type { StakeAction } from './actions/stake';
import type { TransferAction } from './actions/transfer';

export type DelegationAction =
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
  | { action: DelegationAction; actions?: never }
  | { action?: never; actions: DelegationAction[] };

type Expiration = { blockHeight: BlockHeight } | { blockOffset: number };

export type DelegationIntent = Prettify<
  { receiverAccountId: AccountId; expiration: Expiration } & DelegationActions
>;

type DelegationBase = {
  senderAccountId: AccountId;
  senderPublicKey: PublicKey;
  receiverAccountId: AccountId;
  nonce: Nonce;
  blockHash: BlockHash;
  expiration: Expiration;
};

export type Delegation = Prettify<DelegationBase & DelegationActions>;

export type SignedDelegation = {
  delegation: Delegation;
  signature: Signature;
  borsh64SignedDelegation: Base64String;
};
