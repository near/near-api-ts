import type { Prettify } from '../../../../utils';
import type { AccountId, BlockHeight, SequentialNonce } from '../../../common';
import type { NearcorePublicKey, NearcoreSignature, PublicKey, Signature } from '../../../crypto';
import type {
  AddAccessKeyAction,
  NearcoreAddAccessKeyAction,
} from '../delegableActions/addAccessKey';
import type {
  CallContractFunctionAction,
  NearcoreCallContractFunctionAction,
} from '../delegableActions/callContractFunction';
import type {
  CreateSubAccountAction,
  NearcoreCreateSubAccountAction,
} from '../delegableActions/createSubAccount';
import type {
  DeleteAccessKeyAction,
  NearcoreDeleteAccessKeyAction,
} from '../delegableActions/deleteAccessKey';
import type {
  DeleteAccountAction,
  NearcoreDeleteAccountAction,
} from '../delegableActions/deleteAccount';
import type {
  DeployLocalContractAction,
  NearcoreDeployLocalContractAction,
} from '../delegableActions/deployLocalContract';
import type {
  LinkGlobalContractAction,
  NearcoreLinkGlobalContractAction,
} from '../delegableActions/linkGlobalContract';
import type {
  NearcorePinGlobalContractAction,
  PinGlobalContractAction,
} from '../delegableActions/pinGlobalContract';
import type {
  NearcorePublishLinkableGlobalContractAction,
  PublishLinkableGlobalContractAction,
} from '../delegableActions/publishLinkableGlobalContract';
import type {
  NearcorePublishPinnableGlobalContractAction,
  PublishPinnableGlobalContractAction,
} from '../delegableActions/publishPinnableGlobalContract';
import type { NearcoreStakeAction, StakeAction } from '../delegableActions/stake';
import type {
  NearcoreTopUpAccessKeyBalanceAction,
  TopUpAccessKeyBalanceAction,
} from '../delegableActions/topUpAccessKeyBalance';
import type { NearcoreTransferAction, TransferAction } from '../delegableActions/transfer';

export type DelegableAction =
  | CreateSubAccountAction
  | TransferAction
  | AddAccessKeyAction
  | DeployLocalContractAction
  | CallContractFunctionAction
  | StakeAction
  | DeleteAccessKeyAction
  | DeleteAccountAction
  | PublishPinnableGlobalContractAction
  | PublishLinkableGlobalContractAction
  | LinkGlobalContractAction
  | PinGlobalContractAction
  | TopUpAccessKeyBalanceAction;

export type SingleDelegableAction = {
  delegatedAction: DelegableAction;
  delegatedActions?: never;
};

export type MultiDelegableActions = {
  delegatedAction?: never;
  delegatedActions: DelegableAction[];
};

/**
 * A delegation uses the single nonce channel of a key paid from the account balance: nearcore
 * refuses one signed by a key paid from its own balance. Unlike a transaction, it has no
 * `nonceProgression` - nearcore only checks that its nonce is greater than the last one in the
 * channel, `'Increasing'` in the terms of a transaction.
 */
export type DelegationReplayProtection = {
  nonce: SequentialNonce;
};

export type DelegationBase = {
  delegator: {
    accountId: AccountId;
    publicKey: PublicKey;
    replayProtection: DelegationReplayProtection;
  };
  receiverAccountId: AccountId;
  expiration: { blockHeight: BlockHeight };
};

export type SignedDelegation = {
  /**
   * The signed delegation, normalized - whichever of `delegatedAction` /
   * `delegatedActions` was passed in, the signed value carries the action list.
   * `tag` is the message tag the signature was made over - always NEP-366.
   */
  delegation: { tag: number; delegatedActions: DelegableAction[] } & DelegationBase;
  signature: Signature;
};

// Intent

export type DelegationIntent = Prettify<
  {
    receiverAccountId: AccountId;
    expiration: { blockHeight: BlockHeight };
  } & (SingleDelegableAction | MultiDelegableActions)
>;

// Nearcore

export type NearcoreDelegableAction =
  | NearcoreCreateSubAccountAction
  | NearcoreTransferAction
  | NearcoreAddAccessKeyAction
  | NearcoreDeployLocalContractAction
  | NearcoreCallContractFunctionAction
  | NearcoreStakeAction
  | NearcoreDeleteAccessKeyAction
  | NearcoreDeleteAccountAction
  | NearcorePublishPinnableGlobalContractAction
  | NearcorePublishLinkableGlobalContractAction
  | NearcoreLinkGlobalContractAction
  | NearcorePinGlobalContractAction
  | NearcoreTopUpAccessKeyBalanceAction;

// Nearcore `DelegateAction` (NEP-366). Field order follows its declaration, which is the order
// the borsh schemas serialize these in. `tag` is the signing-only prefix.
export type NearcoreDelegation = {
  tag: number;
  senderId: AccountId;
  receiverId: AccountId;
  actions: NearcoreDelegableAction[];
  nonce: bigint;
  maxBlockHeight: bigint;
  publicKey: NearcorePublicKey;
};

export type NearcoreSignedDelegation = {
  delegation: NearcoreDelegation;
  signature: NearcoreSignature;
};
