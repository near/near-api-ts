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

export type FunctionCallParams<Args extends object> = FunctionCallBase &
  FnArgs<Args>;

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
