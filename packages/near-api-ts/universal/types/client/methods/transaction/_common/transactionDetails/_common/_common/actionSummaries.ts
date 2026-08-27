import type { AllowedFunctions, GasBudget } from '../../../../../../../_common/accountAccessKey';
import type {
  AccountId,
  Base64String,
  BlockHeight,
  ContractFunctionName,
  ContractWasmHash,
  DelegationNonce,
} from '../../../../../../../_common/common';
import type { PublicKey, Signature } from '../../../../../../../_common/crypto';
import type { NearGas } from '../../../../../../../_common/nearGas';
import type { NearToken } from '../../../../../../../_common/nearToken';
import type { GlobalContractWasmMutability } from '../../../../../../../_common/transaction/actions/delegableActions/registerGlobalContract';

type CreateAccountActionSummary = {
  actionType: 'CreateAccount';
};

type TransferActionSummary = {
  actionType: 'Transfer';
  amount: NearToken;
};

type AddKeyActionSummary =
  | {
      actionType: 'AddKey';
      accessType: 'FullAccess';
      publicKey: PublicKey;
    }
  | {
      actionType: 'AddKey';
      accessType: 'FunctionCall';
      publicKey: PublicKey;
      contractAccountId: AccountId;
      gasBudget: GasBudget;
      allowedFunctions: AllowedFunctions;
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
 * Nearcore hands back the hash of the registered wasm rather than the wasm itself, the way it
 * does for `DeployContract`. With `wasmMutability: 'Immutable'` that hash is also the identifier
 * a `PinGlobalContract` action takes; a `'Mutable'` contract is addressed by the account id of
 * the account that registered it, which is the receiver of this action.
 */
type RegisterGlobalContractActionSummary = {
  actionType: 'RegisterGlobalContract';
  contractWasmHash: ContractWasmHash;
  wasmMutability: GlobalContractWasmMutability;
};

type LinkGlobalContractActionSummary = {
  actionType: 'LinkGlobalContract';
  globalContractAccountId: AccountId;
};

type PinGlobalContractActionSummary = {
  actionType: 'PinGlobalContract';
  globalContractWasmHash: ContractWasmHash;
};

export type DelegableActionSummary<FA> =
  | CreateAccountActionSummary
  | TransferActionSummary
  | AddKeyActionSummary
  | DeployContractActionSummary
  | FunctionCallActionSummary<FA>
  | StakeActionSummary
  | DeleteKeyActionSummary
  | DeleteAccountActionSummary
  | RegisterGlobalContractActionSummary
  | LinkGlobalContractActionSummary
  | PinGlobalContractActionSummary;

type ExecuteDelegationActionSummary<FA> = {
  actionType: 'ExecuteDelegation';
  delegation: {
    tag: number;
    delegatorAccountId: AccountId;
    delegatorPublicKey: PublicKey;
    delegatedActionSummaries: DelegableActionSummary<FA>[];
    receiverAccountId: AccountId;
    nonce: DelegationNonce;
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
