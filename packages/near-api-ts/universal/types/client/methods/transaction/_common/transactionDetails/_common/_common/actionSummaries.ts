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

export type DelegableActionSummary<FA> =
  | CreateAccountActionSummary
  | TransferActionSummary
  | AddKeyActionSummary
  | DeployContractActionSummary
  | FunctionCallActionSummary<FA>
  | StakeActionSummary
  | DeleteKeyActionSummary
  | DeleteAccountActionSummary;

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
