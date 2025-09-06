import type {
  ContractFunctionName,
  NearOption,
  GasOption,
  MaybeJsonLikeValue,
} from 'nat-types/common';
import type { FnArgs } from 'nat-types/contract';

type FunctionCallBase = {
  fnName: ContractFunctionName;
  gasLimit: GasOption;
  attachedDeposit?: NearOption;
};

export type FunctionCallParams<AJ extends MaybeJsonLikeValue> =
  FunctionCallBase & FnArgs<AJ>;

export type FunctionCallAction<AJ extends MaybeJsonLikeValue> = {
  actionType: 'FunctionCall';
  params: FunctionCallParams<AJ>;
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
