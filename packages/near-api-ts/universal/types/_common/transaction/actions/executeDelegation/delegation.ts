import type { Prettify } from '../../../../utils';
import type { AccountId, BlockHeight, TransactionNonce } from '../../../common';
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
import type {
  LinkGlobalContractAction,
  NearcoreLinkGlobalContractAction,
} from '../delegableActions/linkGlobalContract';
import type {
  NearcorePinGlobalContractAction,
  PinGlobalContractAction,
} from '../delegableActions/pinGlobalContract';
import type {
  NearcoreRegisterGlobalContractAction,
  RegisterGlobalContractAction,
} from '../delegableActions/registerGlobalContract';
import type { NearcoreStakeAction, StakeAction } from '../delegableActions/stake';
import type { NearcoreTransferAction, TransferAction } from '../delegableActions/transfer';

export type DelegableAction =
  | CreateAccountAction
  | TransferAction
  | AddFullAccessKeyAction
  | AddFunctionCallKeyAction
  | DeployContractAction
  | FunctionCallAction
  | StakeAction
  | DeleteKeyAction
  | DeleteAccountAction
  | RegisterGlobalContractAction
  | LinkGlobalContractAction
  | PinGlobalContractAction;

export type SingleDelegableAction = {
  delegatedAction: DelegableAction;
  delegatedActions?: never;
};

export type MultiDelegableActions = {
  delegatedAction?: never;
  delegatedActions: DelegableAction[];
};

export type DelegationBase = {
  delegatorAccountId: AccountId;
  delegatorPublicKey: PublicKey;
  receiverAccountId: AccountId;
  nonce: TransactionNonce;
  expiration: { blockHeight: BlockHeight };
};

export type SignedDelegation = {
  /**
   * The signed delegation, normalized - whichever of `delegatedAction` /
   * `delegatedActions` was passed in, the signed value carries the action list.
   * `tag` is the message tag the signature was made over.
   */
  delegation: { tag: number; delegatedActions: DelegableAction[] } & DelegationBase;
  signature: Signature;
};

// Intent

export type DelegationIntent = Prettify<
  {
    receiverAccountId: AccountId;
    expireAt: { blockHeight: BlockHeight };
  } & (SingleDelegableAction | MultiDelegableActions)
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
  | NearcoreDeleteAccountAction
  | NearcoreRegisterGlobalContractAction
  | NearcoreLinkGlobalContractAction
  | NearcorePinGlobalContractAction;

// Field order follows the nearcore `DelegateAction` declaration, which is the
// order the borsh schemas serialize these in. `tag` is the signing-only prefix.
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
