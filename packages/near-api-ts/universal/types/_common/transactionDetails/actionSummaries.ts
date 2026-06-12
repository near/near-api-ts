import type { Base64String, ContractWasmHash } from '../common';
import type { NearGas } from '../nearGas';
import type { NearToken } from '../nearToken';

export type CreateAccountActionSummary = {
  actionType: 'CreateAccount';
};

export type TransferActionSummary = {
  actionType: 'Transfer';
  amount: NearToken;
};

export type DeployContractActionSummary = {
  actionType: 'DeployContract';
  contractWasmHash: ContractWasmHash;
};

export type FunctionCallActionSummary<FCA> = {
  actionType: 'FunctionCall';
  functionName: string;
  functionArgs: FCA;
  gasLimit: NearGas;
  attachedDeposit: NearToken;
};

export type ActionSummary<FCA> =
  | CreateAccountActionSummary
  | TransferActionSummary
  | DeployContractActionSummary
  | FunctionCallActionSummary<FCA>;

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
