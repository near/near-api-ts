import type { ContractWasmHash } from '../common';
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

export type ActionSummary<FCA = unknown> =
  | CreateAccountActionSummary
  | TransferActionSummary
  | DeployContractActionSummary
  | FunctionCallActionSummary<FCA>;
