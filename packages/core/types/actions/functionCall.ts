import type {
  ContractFunctionName,
  NearOption,
  GasOption,
} from 'nat-types/common';
import type { FnArgs } from 'nat-types/contract';

type FunctionCallBase = {
  fnName: ContractFunctionName;
  gasLimit: GasOption;
  attachedDeposit?: NearOption;
};
// TODO rework 'extends object'
export type FunctionCallParams<Args extends object> = FunctionCallBase &
  FnArgs<Args>;
// TODO rework 'extends object'
export type FunctionCallAction<Args extends object> = {
  actionType: 'FunctionCall';
  params: FunctionCallParams<Args>;
};

// ****** NATIVE ********

export type NativeFunctionCallAction = {
  functionCall: {
    methodName: string;
    args: Uint8Array;
    gas: bigint;
    deposit: bigint;
  };
};
