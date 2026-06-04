import type { NearGas } from '../nearGas';
import type { NearToken } from '../nearToken';

export type FunctionCallActionSummary = {
  actionType: 'FunctionCall';
  functionName: string;
  functionArgs: unknown;
  gasLimit: NearGas;
  attachedDeposit: NearToken;
};

export type ActionSummary = FunctionCallActionSummary | unknown;

export type ActionSummaries = ActionSummary[];
