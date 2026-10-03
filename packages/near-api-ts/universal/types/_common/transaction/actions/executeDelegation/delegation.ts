import type { Prettify } from '../../../../utils';
import type { AccountId, BlockHeight, SequentialNonce } from '../../../common';
import type { NearcorePublicKey, NearcoreSignature, PublicKey, Signature } from '../../../crypto';
import type { NearcoreTransactionNonce } from '../../transaction';
import type {
  AddAccessKeyAction,
  NearcoreAddAccessKeyAction,
} from '../delegableActions/addAccessKey';
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
import type {
  LinkGlobalContractAction,
  NearcoreLinkGlobalContractAction,
} from '../delegableActions/linkGlobalContract';
import type {
  NearcorePinGlobalContractAction,
  PinGlobalContractAction,
} from '../delegableActions/pinGlobalContract';
import type {
  NearcoreRegisterLinkableGlobalContractAction,
  RegisterLinkableGlobalContractAction,
} from '../delegableActions/registerLinkableGlobalContract';
import type {
  NearcoreRegisterPinnableGlobalContractAction,
  RegisterPinnableGlobalContractAction,
} from '../delegableActions/registerPinnableGlobalContract';
import type { NearcoreStakeAction, StakeAction } from '../delegableActions/stake';
import type {
  NearcoreTopUpAccessKeyBalanceAction,
  TopUpAccessKeyBalanceAction,
} from '../delegableActions/topUpAccessKeyBalance';
import type { NearcoreTransferAction, TransferAction } from '../delegableActions/transfer';
import type {
  NearcoreWithdrawAccessKeyBalanceAction,
  WithdrawAccessKeyBalanceAction,
} from '../delegableActions/withdrawAccessKeyBalance';

export type DelegableAction =
  | CreateAccountAction
  | TransferAction
  | AddAccessKeyAction
  | DeployContractAction
  | FunctionCallAction
  | StakeAction
  | DeleteKeyAction
  | DeleteAccountAction
  | RegisterPinnableGlobalContractAction
  | RegisterLinkableGlobalContractAction
  | LinkGlobalContractAction
  | PinGlobalContractAction
  | TopUpAccessKeyBalanceAction
  | WithdrawAccessKeyBalanceAction;

export type SingleDelegableAction = {
  delegatedAction: DelegableAction;
  delegatedActions?: never;
};

export type MultiDelegableActions = {
  delegatedAction?: never;
  delegatedActions: DelegableAction[];
};

/**
 * The delegation uses the single nonce channel of a key paid from the account balance.
 */
type NonceChannelDelegationReplayProtection = {
  scheme: 'NonceChannel';
  nonce: SequentialNonce;
  nonceChannelId?: never;
};

/**
 * The delegation uses one of the nonce channels of a key paid from its own balance -
 * `nonceChannelId` is 0..channelCount - 1.
 */
type NonceChannelsDelegationReplayProtection = {
  scheme: 'NonceChannels';
  nonceChannelId: number;
  nonce: SequentialNonce;
};

/**
 * Unlike a transaction, a delegation has no `nonceProgression`: nearcore only checks that its
 * nonce is greater than the last one in the channel - `'Increasing'` in the terms of a transaction.
 */
export type DelegationReplayProtection =
  | NonceChannelDelegationReplayProtection
  | NonceChannelsDelegationReplayProtection;

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
   * `tag` is the message tag the signature was made over, and it tells the two formats
   * nearcore accepts apart: NEP-611 (`DelegateActionV2`), the one `signDelegation` signs,
   * and NEP-366 (`DelegateAction`), still produced by other signers, which can only use
   * the `'NonceChannel'` scheme.
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
  | NearcoreCreateAccountAction
  | NearcoreTransferAction
  | NearcoreAddAccessKeyAction
  | NearcoreDeployContractAction
  | NearcoreFunctionCallAction
  | NearcoreStakeAction
  | NearcoreDeleteKeyAction
  | NearcoreDeleteAccountAction
  | NearcoreRegisterPinnableGlobalContractAction
  | NearcoreRegisterLinkableGlobalContractAction
  | NearcoreLinkGlobalContractAction
  | NearcorePinGlobalContractAction
  | NearcoreTopUpAccessKeyBalanceAction
  | NearcoreWithdrawAccessKeyBalanceAction;

// Nearcore `DelegateAction` (NEP-366). Field order follows its declaration, which is the order
// the borsh schemas serialize these in. `tag` is the signing-only prefix.
export type NearcoreDelegationV1 = {
  tag: number;
  senderId: AccountId;
  receiverId: AccountId;
  actions: NearcoreDelegableAction[];
  nonce: bigint;
  maxBlockHeight: bigint;
  publicKey: NearcorePublicKey;
};

// Nearcore `DelegateActionV2` (NEP-611) - its nonce picks a nonce channel the same way the one
// of a transaction does. `tag` is the signing-only prefix; `version` is the discriminant of
// `VersionedDelegateActionPayload::V2` (0), which goes both into the signed and the wire bytes.
export type NearcoreDelegationV2 = {
  tag: number;
  version: 0;
  senderId: AccountId;
  receiverId: AccountId;
  actions: NearcoreDelegableAction[];
  nonce: NearcoreTransactionNonce;
  maxBlockHeight: bigint;
  publicKey: NearcorePublicKey;
};

export type NearcoreSignedDelegationV1 = {
  delegation: NearcoreDelegationV1;
  signature: NearcoreSignature;
};

export type NearcoreSignedDelegationV2 = {
  delegation: NearcoreDelegationV2;
  signature: NearcoreSignature;
};
