import type { AllowedFunctions, GasBudget } from '../accountAccessKey';
import type { AccountId, Base64String, ContractFunctionName, ContractWasmHash } from '../common';
import type { PublicKey } from '../crypto';
import type { NearGas } from '../nearGas';
import type { NearToken } from '../nearToken';
import type { CreateAccountAction } from '../transaction/actions/createAccount';
import type { DeleteAccountAction } from '../transaction/actions/deleteAccount';
import type { DeleteKeyAction } from '../transaction/actions/deleteKey';

export type CreateAccountActionSummary = CreateAccountAction;

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

export type DeleteKeyActionSummary = DeleteKeyAction;
export type DeleteAccountActionSummary = DeleteAccountAction;

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
