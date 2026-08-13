import type { AllowedFunctions, GasBudget } from '../../../../../../../_common/accountAccessKey';
import type {
  AccountId,
  Base64String,
  ContractFunctionName,
  ContractWasmHash,
} from '../../../../../../../_common/common';
import type { PublicKey } from '../../../../../../../_common/crypto';
import type { NearGas } from '../../../../../../../_common/nearGas';
import type { NearToken } from '../../../../../../../_common/nearToken';

export type CreateAccountActionSummary = {
  actionType: 'CreateAccount';
};

export type TransferActionSummary = {
  actionType: 'Transfer';
  amount: NearToken;
};

export type AddKeyActionSummary =
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

export type DeployContractActionSummary = {
  actionType: 'DeployContract';
  contractWasmHash: ContractWasmHash;
};

export type FunctionCallActionSummary<FA> = {
  actionType: 'FunctionCall';
  functionName: ContractFunctionName;
  functionArgs: FA;
  gasLimit: NearGas;
  attachedDeposit: NearToken;
};

export type StakeActionSummary = {
  actionType: 'Stake';
  amount: NearToken;
  validatorPublicKey: PublicKey;
};

export type DeleteKeyActionSummary = {
  actionType: 'DeleteKey';
  publicKey: PublicKey;
};

export type DeleteAccountActionSummary = {
  actionType: 'DeleteAccount';
  beneficiaryAccountId: AccountId;
};

export type ActionSummary<FA> =
  | CreateAccountActionSummary
  | TransferActionSummary
  | AddKeyActionSummary
  | DeployContractActionSummary
  | FunctionCallActionSummary<FA>
  | StakeActionSummary
  | DeleteKeyActionSummary
  | DeleteAccountActionSummary;

/**
 * Return by default when there is no user-defined deserializeActionSummaries function;
 * FunctionCallActionSummary.functionArgs is unknown JSON or Base64String;
 */
export type ParsedActionSummary = ActionSummary<unknown>;

/**
 * We pass this type of ActionSummaries as an argument into the deserializeActionSummaries function;
 * FunctionCallActionSummary.functionArgs is always Base64String;
 */
export type RawActionSummary = ActionSummary<Base64String>;
