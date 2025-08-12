import type {
  ContractFunctionName,
  NearOption,
  GasOption,
} from 'nat-types/common';

type FnArgsJson<ArgsJson> = { fnArgsJson: ArgsJson; fnArgsBinary?: never };
type FnArgsBinary = { fnArgsJson?: never; fnArgsBinary?: Uint8Array };

type FunctionCallBase = {
  fnName: ContractFunctionName;
  gasLimit: GasOption;
  attachedDeposit?: NearOption;
};

export type FunctionCallParams<ArgsJson extends object> = FunctionCallBase &
  (FnArgsBinary | FnArgsJson<ArgsJson>);

export type FunctionCallAction<ArgsJson extends object> = {
  type: 'FunctionCall';
  params: FunctionCallParams<ArgsJson>;
};

export type NativeFunctionCallAction = {
  functionCall: {
    methodName: string;
    args: Uint8Array;
    gas: bigint;
    deposit: bigint;
  };
};
