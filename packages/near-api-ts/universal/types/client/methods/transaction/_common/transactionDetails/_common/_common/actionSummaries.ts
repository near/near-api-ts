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
  | TopUpAccessKeyBalanceActionSummary
  | WithdrawAccessKeyBalanceActionSummary;

/**
 * The replay protection of a relayed delegation, as the chain recorded it. A NEP-366 delegation
 * always uses the single nonce channel of its key. A NEP-611 one could also use one of the nonce
 * channels of a key paid from its own balance.
 */
export type ExecuteDelegationReplayProtectionSummary =
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

// `tag` tells the delegation format apart: NEP-366 for nearcore `Delegate`, NEP-611 for
// `DelegateV2`. Nearcore refuses new NEP-611 delegations since protocol 87, so only the
// transactions sent before it carry one.
type ExecuteDelegationActionSummary<FA> = {
  actionType: 'ExecuteDelegation';
  delegation: {
    tag: number;
    delegator: {
      accountId: AccountId;
      publicKey: PublicKey;
      replayProtection: ExecuteDelegationReplayProtectionSummary;
    };
    delegatedActionSummaries: DelegableActionSummary<FA>[];
    receiverAccountId: AccountId;
    expiration: { blockHeight: BlockHeight };
  };
  signature: Signature;
};

export type TransactionActionSummary<FA> =
  | DelegableActionSummary<FA>
  | ExecuteDelegationActionSummary<FA>;

/**
 * Return by default when there is no user-defined deserializeActionSummaries function;
 * CallContractFunctionActionSummary.functionArgs is unknown JSON or Base64String;
 */
export type ParsedTransactionActionSummary = TransactionActionSummary<unknown>;

/**
 * We pass this type of ActionSummaries as an argument into the deserializeActionSummaries function;
 * CallContractFunctionActionSummary.functionArgs is always Base64String;
 */
export type RawTransactionActionSummary = TransactionActionSummary<Base64String>;
