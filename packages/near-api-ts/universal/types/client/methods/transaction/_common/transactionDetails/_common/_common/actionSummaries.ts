import type { constants } from '../../../../../../../../src/_common/_common/_common/constants';
import type {
  ContractFunctionCallPermission,
  FullAccessPermission,
} from '../../../../../../../_common/accessKey';
import type {
  AccountId,
  Base64String,
  BlockHeight,
  ContractFunctionName,
  ContractWasmHash,
  SequentialNonce,
} from '../../../../../../../_common/common';
import type { PublicKey, Signature } from '../../../../../../../_common/crypto';
import type { NearGas } from '../../../../../../../_common/nearGas';
import type { NearToken } from '../../../../../../../_common/nearToken';
import type { ProtocolEra } from './protocolEra';

type CreateSubAccountActionSummary = {
  actionType: 'CreateSubAccount';
};

type TransferActionSummary = {
  actionType: 'Transfer';
  amount: NearToken;
};

// Mirrors `AddAccessKeyAction`. A gas key's balance is left out: nearcore adds it empty, always
export type AddAccessKeyActionSummary =
  | {
      actionType: 'AddAccessKey';
      publicKey: PublicKey;
      permission: FullAccessPermission;
      gasPayment: { source: 'AccountBalance'; allowance: 'Unlimited' };
      replayProtection: { scheme: 'NonceChannel' };
    }
  | {
      actionType: 'AddAccessKey';
      publicKey: PublicKey;
      permission: ContractFunctionCallPermission;
      gasPayment: { source: 'AccountBalance'; allowance: 'Unlimited' | NearToken };
      replayProtection: { scheme: 'NonceChannel' };
    }
  | {
      actionType: 'AddAccessKey';
      publicKey: PublicKey;
      permission: FullAccessPermission;
      gasPayment: { source: 'KeyBalance' };
      replayProtection: { scheme: 'NonceChannels'; channelCount: number };
    }
  | {
      actionType: 'AddAccessKey';
      publicKey: PublicKey;
      permission: ContractFunctionCallPermission;
      gasPayment: { source: 'KeyBalance' };
      replayProtection: { scheme: 'NonceChannels'; channelCount: number };
    };

type DeployLocalContractActionSummary = {
  actionType: 'DeployLocalContract';
  contractWasmHash: ContractWasmHash;
};

type CallContractFunctionActionSummary<FA> = {
  actionType: 'CallContractFunction';
  functionName: ContractFunctionName;
  functionArgs: FA;
  gasLimit: NearGas;
  attachedDeposit: NearToken;
};

type StakeActionSummary = {
  actionType: 'Stake';
  amount: NearToken;
  validatorPublicKey: PublicKey;
};

type DeleteAccessKeyActionSummary = {
  actionType: 'DeleteAccessKey';
  publicKey: PublicKey;
};

type DeleteAccountActionSummary = {
  actionType: 'DeleteAccount';
  beneficiaryAccountId: AccountId;
};

/**
 * Nearcore hands back the hash of the published wasm rather than the wasm itself,
 * the way it does for `DeployLocalContract`.
 */
type PublishPinnableGlobalContractActionSummary = {
  actionType: 'PublishPinnableGlobalContract';
  contractWasmHash: ContractWasmHash;
};

type PublishLinkableGlobalContractActionSummary = {
  actionType: 'PublishLinkableGlobalContract';
  contractWasmHash: ContractWasmHash;
};

type LinkGlobalContractActionSummary = {
  actionType: 'LinkGlobalContract';
  globalContractAccountId: AccountId;
};

type PinGlobalContractActionSummary = {
  actionType: 'PinGlobalContract';
  globalContractWasmHash: ContractWasmHash;
};

type TopUpAccessKeyBalanceActionSummary = {
  actionType: 'TopUpAccessKeyBalance';
  publicKey: PublicKey;
  amount: NearToken;
};

type WithdrawAccessKeyBalanceActionSummary = {
  actionType: 'WithdrawAccessKeyBalance';
  publicKey: PublicKey;
  amount: NearToken;
};

/**
 * A withdrawal from a key balance inside a delegation.
 *
 * @legacy Protocol 85–86 (nearcore 2.13). Protocol 87 refuses a withdrawal inside any delegation,
 * so only transactions sent before it carry one.
 */
type LegacyWithdrawAccessKeyBalanceActionSummary = {
  /**
   * @legacy Protocol 85–86 (nearcore 2.13). Protocol 87 refuses a withdrawal inside any
   * delegation, so only transactions sent before it carry one.
   */
  actionType: 'LegacyWithdrawAccessKeyBalance';
  publicKey: PublicKey;
  amount: NearToken;
};

// What a delegation can carry now - mirrors `DelegableAction`
export type DelegableActionSummary<FA> =
  | CreateSubAccountActionSummary
  | TransferActionSummary
  | AddAccessKeyActionSummary
  | DeployLocalContractActionSummary
  | CallContractFunctionActionSummary<FA>
  | StakeActionSummary
  | DeleteAccessKeyActionSummary
  | DeleteAccountActionSummary
  | PublishPinnableGlobalContractActionSummary
  | PublishLinkableGlobalContractActionSummary
  | LinkGlobalContractActionSummary
  | PinGlobalContractActionSummary
  | TopUpAccessKeyBalanceActionSummary;

// What each protocol era adds to the actions of a delegation - see `ProtocolEra`
type DelegatedActionSummaryByEra<FA> = {
  Live: DelegableActionSummary<FA>;
  Legacy: LegacyWithdrawAccessKeyBalanceActionSummary;
};

export type DelegatedActionSummary<
  PE extends ProtocolEra,
  FA,
> = DelegatedActionSummaryByEra<FA>[PE];

// A delegation in the format nearcore calls `Delegate` (NEP-366), the only one the current protocol
// takes. On older protocol versions it could already carry a withdrawal, hence `PE`.
type ExecuteDelegationActionSummary<PE extends ProtocolEra, FA> = {
  actionType: 'ExecuteDelegation';
  delegation: {
    /** The message tag the signature was made over. */
    tag: typeof constants.Delegation.Nep366Tag;
    delegator: {
      accountId: AccountId;
      publicKey: PublicKey;
      replayProtection: { nonce: SequentialNonce };
    };
    delegatedActionSummaries: DelegatedActionSummary<PE, FA>[];
    receiverAccountId: AccountId;
    expiration: { blockHeight: BlockHeight };
  };
  signature: Signature;
};

/**
 * The replay protection of a delegation in the format nearcore calls `DelegateV2` (NEP-611): the
 * single nonce channel of a key paid from the account balance, or one of the nonce channels of a
 * key paid from its own balance.
 *
 * @legacy Protocol 85–86 (nearcore 2.13).
 */
export type LegacyExecuteDelegationReplayProtectionSummary =
  | {
      scheme: 'NonceChannel';
      nonce: SequentialNonce;
      nonceChannelId?: never;
    }
  | {
      scheme: 'NonceChannels';
      nonceChannelId: number;
      nonce: SequentialNonce;
    };

/**
 * A delegation in the format nearcore calls `DelegateV2` (NEP-611).
 *
 * @legacy Protocol 85–86 (nearcore 2.13). Protocol 87 refuses new NEP-611 delegations, so only
 * transactions sent before it carry one.
 */
type LegacyExecuteDelegationActionSummary<FA> = {
  /**
   * @legacy Protocol 85–86 (nearcore 2.13). Protocol 87 refuses new NEP-611 delegations, so only
   * transactions sent before it carry one.
   */
  actionType: 'LegacyExecuteDelegation';
  delegation: {
    /** The message tag the signature was made over. */
    tag: typeof constants.Delegation.Nep611Tag;
    delegator: {
      accountId: AccountId;
      publicKey: PublicKey;
      replayProtection: LegacyExecuteDelegationReplayProtectionSummary;
    };
    delegatedActionSummaries: DelegatedActionSummary<'Live' | 'Legacy', FA>[];
    receiverAccountId: AccountId;
    expiration: { blockHeight: BlockHeight };
  };
  signature: Signature;
};

// What each protocol era adds - see `ProtocolEra`. A delegation is live, only what it carries
// depends on the era.
type TransactionActionSummaryByEra<PE extends ProtocolEra, FA> = {
  Live:
    | DelegableActionSummary<FA>
    | WithdrawAccessKeyBalanceActionSummary
    | ExecuteDelegationActionSummary<PE, FA>;
  Legacy: LegacyExecuteDelegationActionSummary<FA>;
};

export type TransactionActionSummary<PE extends ProtocolEra, FA> = TransactionActionSummaryByEra<
  PE,
  FA
>[PE];

/**
 * Return by default when there is no user-defined deserializeActionSummaries function;
 * CallContractFunctionActionSummary.functionArgs is unknown JSON or Base64String;
 */
export type ParsedTransactionActionSummary<PE extends ProtocolEra> = TransactionActionSummary<
  PE,
  unknown
>;

/**
 * We pass this type of ActionSummaries as an argument into the deserializeActionSummaries function;
 * CallContractFunctionActionSummary.functionArgs is always Base64String;
 */
export type RawTransactionActionSummary<PE extends ProtocolEra> = TransactionActionSummary<
  PE,
  Base64String
>;
