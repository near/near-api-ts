import type {
  FullAccessPermission,
  FunctionCallPermission,
} from '../../../../../../../_common/accessKey';
import type {
  AccountId,
  Base64String,
  BlockHeight,
  ContractFunctionName,
  ContractWasmHash,
} from '../../../../../../../_common/common';
import type { PublicKey, Signature } from '../../../../../../../_common/crypto';
import type { NearGas } from '../../../../../../../_common/nearGas';
import type { NearToken } from '../../../../../../../_common/nearToken';
import type { DelegationReplayProtection } from '../../../../../../../_common/transaction/actions/executeDelegation/delegation';

type CreateAccountActionSummary = {
  actionType: 'CreateAccount';
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
      gasPayment: { source: 'AccountBalance' };
    }
  | {
      actionType: 'AddAccessKey';
      publicKey: PublicKey;
      permission: FunctionCallPermission;
      gasPayment: { source: 'AccountBalance'; allowance: 'Unlimited' | NearToken };
    }
  | {
      actionType: 'AddAccessKey';
      publicKey: PublicKey;
      permission: FullAccessPermission;
      gasPayment: { source: 'KeyBalance' };
      replayProtection: { channelCount: number };
    }
  | {
      actionType: 'AddAccessKey';
      publicKey: PublicKey;
      permission: FunctionCallPermission;
      gasPayment: { source: 'KeyBalance' };
      replayProtection: { channelCount: number };
    };

type DeployContractActionSummary = {
  actionType: 'DeployContract';
  contractWasmHash: ContractWasmHash;
};

type FunctionCallActionSummary<FA> = {
  actionType: 'FunctionCall';
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

type DeleteKeyActionSummary = {
  actionType: 'DeleteKey';
  publicKey: PublicKey;
};

type DeleteAccountActionSummary = {
  actionType: 'DeleteAccount';
  beneficiaryAccountId: AccountId;
};

/**
 * Nearcore hands back the hash of the registered wasm rather than the wasm itself,
 * the way it does for `DeployContract`.
 */
type RegisterPinnableGlobalContractActionSummary = {
  actionType: 'RegisterPinnableGlobalContract';
  contractWasmHash: ContractWasmHash;
};

type RegisterLinkableGlobalContractActionSummary = {
  actionType: 'RegisterLinkableGlobalContract';
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
  | CreateAccountActionSummary
  | TransferActionSummary
  | AddAccessKeyActionSummary
  | DeployContractActionSummary
  | FunctionCallActionSummary<FA>
  | StakeActionSummary
  | DeleteKeyActionSummary
  | DeleteAccountActionSummary
  | RegisterPinnableGlobalContractActionSummary
  | RegisterLinkableGlobalContractActionSummary
  | LinkGlobalContractActionSummary
  | PinGlobalContractActionSummary
  | TopUpAccessKeyBalanceActionSummary
  | WithdrawAccessKeyBalanceActionSummary;

// `tag` tells the delegation format apart, like in `SignedDelegation`: NEP-366 for nearcore
// `Delegate`, NEP-611 for `DelegateV2`.
type ExecuteDelegationActionSummary<FA> = {
  actionType: 'ExecuteDelegation';
  delegation: {
    tag: number;
    delegator: {
      accountId: AccountId;
      publicKey: PublicKey;
      replayProtection: DelegationReplayProtection;
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
 * FunctionCallActionSummary.functionArgs is unknown JSON or Base64String;
 */
export type ParsedTransactionActionSummary = TransactionActionSummary<unknown>;

/**
 * We pass this type of ActionSummaries as an argument into the deserializeActionSummaries function;
 * FunctionCallActionSummary.functionArgs is always Base64String;
 */
export type RawTransactionActionSummary = TransactionActionSummary<Base64String>;
