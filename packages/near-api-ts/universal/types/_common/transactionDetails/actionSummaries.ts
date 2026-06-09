import type { NearGas } from '../nearGas';
import type { NearToken } from '../nearToken';

export type CreateAccountActionSummary = {
  actionType: 'CreateAccount';
};

export type FunctionCallActionSummary<FCA> = {
  actionType: 'FunctionCall';
  functionName: string;
  functionArgs: FCA;
  gasLimit: NearGas;
  attachedDeposit: NearToken;
};

export type ActionSummary<FCA = unknown> =
  | FunctionCallActionSummary<FCA>
  | CreateAccountActionSummary;
