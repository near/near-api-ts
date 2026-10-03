import type { Prettify } from '../../utils';
import type { AccountId, BlockHash, SequentialNonce } from '../common';
import type { NearcorePublicKey, NearcoreSignature, PublicKey, Signature } from '../crypto';
import type {
  AddAccessKeyAction,
  NearcoreAddAccessKeyAction,
} from './actions/delegableActions/addAccessKey';
import type {
  CreateAccountAction,
  NearcoreCreateAccountAction,
} from './actions/delegableActions/createAccount';
import type {
  DeleteAccountAction,
  NearcoreDeleteAccountAction,
} from './actions/delegableActions/deleteAccount';
import type {
  DeleteKeyAction,
  NearcoreDeleteKeyAction,
} from './actions/delegableActions/deleteKey';
import type {
  DeployContractAction,
  NearcoreDeployContractAction,
} from './actions/delegableActions/deployContract';
import type {
  FunctionCallAction,
  NearcoreFunctionCallAction,
} from './actions/delegableActions/functionCall';
import type {
  LinkGlobalContractAction,
  NearcoreLinkGlobalContractAction,
} from './actions/delegableActions/linkGlobalContract';
import type {
  NearcorePinGlobalContractAction,
  PinGlobalContractAction,
} from './actions/delegableActions/pinGlobalContract';
import type {
  NearcoreRegisterLinkableGlobalContractAction,
  RegisterLinkableGlobalContractAction,
} from './actions/delegableActions/registerLinkableGlobalContract';
import type {
  NearcoreRegisterPinnableGlobalContractAction,
  RegisterPinnableGlobalContractAction,
} from './actions/delegableActions/registerPinnableGlobalContract';
import type { NearcoreStakeAction, StakeAction } from './actions/delegableActions/stake';
import type {
  NearcoreTopUpAccessKeyBalanceAction,
  TopUpAccessKeyBalanceAction,
} from './actions/delegableActions/topUpAccessKeyBalance';
import type { NearcoreTransferAction, TransferAction } from './actions/delegableActions/transfer';
import type {
  NearcoreWithdrawAccessKeyBalanceAction,
  WithdrawAccessKeyBalanceAction,
} from './actions/delegableActions/withdrawAccessKeyBalance';
import type {
  ExecuteDelegationAction,
  NearcoreExecuteDelegationAction,
} from './actions/executeDelegation/executeDelegation';

export type TransactionAction =
  | CreateAccountAction
  | TransferAction
  | AddAccessKeyAction
  | DeployContractAction
  | FunctionCallAction
  | StakeAction
  | DeleteKeyAction
  | DeleteAccountAction
  | ExecuteDelegationAction
  | RegisterPinnableGlobalContractAction
  | RegisterLinkableGlobalContractAction
  | LinkGlobalContractAction
  | PinGlobalContractAction
  | TopUpAccessKeyBalanceAction
  | WithdrawAccessKeyBalanceAction;

type SingleTransactionAction = { action: TransactionAction; actions?: never };
type MultiTransactionActions = { action?: never; actions: TransactionAction[] };

/**
 * How the nonce of a transaction must relate to the last nonce of its channel:
 * - `'Consecutive'` — exactly the next one, `lastNonce + 1`;
 * - `'Increasing'` — any nonce greater than `lastNonce`, gaps allowed.
 *
 * Nearcore calls it the nonce mode: `Strict` and `Monotonic`.
 */
export type NonceProgression = 'Consecutive' | 'Increasing';

/**
 * The transaction uses the single nonce channel of a key paid from the account balance.
 * `nonceProgression` defaults to `'Consecutive'`.
 */
type NonceChannelReplayProtection = {
  scheme: 'NonceChannel';
  nonce: SequentialNonce;
  nonceProgression?: NonceProgression;
  nonceChannelId?: never;
};

/**
 * The transaction uses one of the nonce channels of a key paid from its own balance -
 * `nonceChannelId` is 0..channelCount - 1. `nonceProgression` defaults to `'Consecutive'`.
 */
type NonceChannelsReplayProtection = {
  scheme: 'NonceChannels';
  nonceChannelId: number;
  nonce: SequentialNonce;
  nonceProgression?: NonceProgression;
};

export type TransactionReplayProtection =
  | NonceChannelReplayProtection
  | NonceChannelsReplayProtection;

type TransactionBase = {
  signer: {
    accountId: AccountId;
    publicKey: PublicKey;
    replayProtection: TransactionReplayProtection;
  };
  receiverAccountId: AccountId;
  recentBlockHash: BlockHash;
};

export type Transaction = TransactionBase & (SingleTransactionAction | MultiTransactionActions);

export type TransactionIntent = Prettify<
  {
    receiverAccountId: AccountId;
  } & (SingleTransactionAction | MultiTransactionActions)
>;

/**
 * The replay protection of a signed transaction, with the default `nonceProgression`
 * filled in - the one the signature covers.
 */
export type SignedTransactionReplayProtection =
  | (NonceChannelReplayProtection & { nonceProgression: NonceProgression })
  | (NonceChannelsReplayProtection & { nonceProgression: NonceProgression });

export type SignedTransaction = {
  transaction: {
    signer: {
      accountId: AccountId;
      publicKey: PublicKey;
      replayProtection: SignedTransactionReplayProtection;
    };
    actions: TransactionAction[];
    receiverAccountId: AccountId;
    recentBlockHash: BlockHash;
  };
  signature: Signature;
};

// Nearcore Transaction
export type NearcoreTransactionAction =
  | NearcoreCreateAccountAction
  | NearcoreTransferAction
  | NearcoreAddAccessKeyAction
  | NearcoreDeployContractAction
  | NearcoreFunctionCallAction
  | NearcoreStakeAction
  | NearcoreDeleteKeyAction
  | NearcoreDeleteAccountAction
  | NearcoreExecuteDelegationAction
  | NearcoreRegisterPinnableGlobalContractAction
  | NearcoreRegisterLinkableGlobalContractAction
  | NearcoreLinkGlobalContractAction
  | NearcorePinGlobalContractAction
  | NearcoreTopUpAccessKeyBalanceAction
  | NearcoreWithdrawAccessKeyBalanceAction;

export type NearcoreTransactionNonce =
  | { nonce: { nonce: bigint } }
  | { gasKeyNonce: { nonce: bigint; nonceIndex: number } };

export type NearcoreNonceMode = { monotonic: {} } | { strict: {} };

// Nearcore `TransactionV1`, the only transaction version this library sends. Field order follows
// the nearcore declaration, which is the order the borsh schema serializes them in. `version` is
// the `1u8` nearcore writes in front of a V1 transaction, and it is a part of the signed bytes.
export type NearcoreTransaction = {
  version: 1;
  signerId: AccountId;
  publicKey: NearcorePublicKey;
  nonce: NearcoreTransactionNonce;
  receiverId: AccountId;
  blockHash: Uint8Array;
  actions: NearcoreTransactionAction[];
  nonceMode: NearcoreNonceMode;
};

export type NearcoreSignedTransaction = {
  transaction: NearcoreTransaction;
  signature: NearcoreSignature;
};
