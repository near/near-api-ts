import type { Prettify } from '../../../../utils';
import type { AccountId, Base64String, BlockHeight, TransactionNonce } from '../../../common';
import type { NearcorePublicKey, NearcoreSignature, PublicKey, Signature } from '../../../crypto';
import type {
  AddFullAccessKeyAction,
  AddFunctionCallKeyAction,
  NearcoreAddKeyAction,
} from '../delegableActions/addKey';
import type {
  CreateAccountAction,
  NearcoreCreateAccountAction,
} from '../delegableActions/createAccount';
import type {
  DeleteAccountAction,
  NearcoreDeleteAccountAction,
} from '../delegableActions/deleteAccount';
import type { DeleteKeyAction, NearcoreDeleteKeyAction } from '../delegableActions/deleteKey';
import type {
  DeployContractAction,
  NearcoreDeployContractAction,
} from '../delegableActions/deployContract';
import type {
  FunctionCallAction,
  NearcoreFunctionCallAction,
} from '../delegableActions/functionCall';
import type { NearcoreStakeAction, StakeAction } from '../delegableActions/stake';
import type { NearcoreTransferAction, TransferAction } from '../delegableActions/transfer';

export type DelegatedAction =
  | CreateAccountAction
  | TransferAction
  | AddFullAccessKeyAction
  | AddFunctionCallKeyAction
  | DeployContractAction
  | FunctionCallAction
  | StakeAction
  | DeleteKeyAction
  | DeleteAccountAction;

export type SingleDelegatedAction = {
  delegatedAction: DelegatedAction;
  delegatedActions?: never;
};

export type MultiDelegatedActions = {
  delegatedAction?: never;
  delegatedActions: DelegatedAction[];
};

type DelegationBase = {
  delegatorAccountId: AccountId;
  delegatorPublicKey: PublicKey;
  receiverAccountId: AccountId;
  nonce: TransactionNonce;
  expireAt: { blockHeight: BlockHeight };
};

export type Delegation = Prettify<DelegationBase & (SingleDelegatedAction | MultiDelegatedActions)>;

export type SignedDelegation = {
  /**
   * The signed delegation, normalized - whichever of `delegatedAction` /
   * `delegatedActions` was passed in, the signed value carries the action list.
   * `tag` is the message tag the signature was made over.
   */
  delegation: Prettify<{ tag: number; delegatedActions: DelegatedAction[] } & DelegationBase>;
  signature: Signature;
  signedDelegationBorsh64: Base64String;
};

// Intent

export type DelegationIntent = Prettify<
  {
    receiverAccountId: AccountId;
    expireAt: { blockHeight: BlockHeight };
  } & (SingleDelegatedAction | MultiDelegatedActions)
>;

// Nearcore

export type NearcoreDelegableAction =
  | NearcoreCreateAccountAction
  | NearcoreTransferAction
  | NearcoreAddKeyAction
  | NearcoreDeployContractAction
  | NearcoreFunctionCallAction
  | NearcoreStakeAction
  | NearcoreDeleteKeyAction
  | NearcoreDeleteAccountAction;

// Field order follows the nearcore `DelegateAction` declaration, which is the
// order the borsh schemas serialize these in. `tag` is the signing-only prefix.
export type NearcoreDelegation = {
  tag: number;
  senderId: AccountId;
  receiverId: AccountId;
  actions: NearcoreDelegableAction[];
  nonce: bigint;
  maxBlockHeight: number;
  publicKey: NearcorePublicKey;
};

export type NearcoreSignedDelegation = {
  delegation: NearcoreDelegation;
  signature: NearcoreSignature;
};
