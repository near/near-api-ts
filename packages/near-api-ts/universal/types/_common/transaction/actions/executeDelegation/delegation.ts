import type { Prettify } from '../../../../utils';
import type {
  AccountId,
  Base64String,
  BlockHash,
  BlockHeight,
  TransactionNonce,
} from '../../../common';
import type { NearcorePublicKey, NearcoreSignature, PublicKey, Signature } from '../../../crypto';
import type { NearcoreTransaction } from '../../transaction';
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

export type SignedDelegation = {
  delegation: {
    tag: number;
    senderAccountId: AccountId;
    senderPublicKey: PublicKey;
    delegatedActions: DelegatedAction[];
    receiverAccountId: AccountId;
    nonce: TransactionNonce;
    expireAt: { blockHeight: BlockHeight };
  };
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

export type NearcoreDelegation = {
  tag: number;
  signerId: AccountId;
  publicKey: NearcorePublicKey;
  actions: NearcoreDelegableAction[];
  receiverId: AccountId;
  nonce: bigint;
  maxBlockHeight: number;
};

export type NearcoreSignedDelegation = {
  delegation: NearcoreDelegation;
  signature: NearcoreSignature;
};
