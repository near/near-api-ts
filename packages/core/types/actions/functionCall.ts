import type {
  ContractFunctionName,
  NearTokenArgs,
  NearGasArgs,
  MaybeJsonLikeValue,
} from 'nat-types/common';
import type { KeyIf } from 'nat-types/utils';

type BaseFunctionCallActionArgs = {
  functionName: ContractFunctionName;
  gasLimit: NearGasArgs;
  attachedDeposit?: NearTokenArgs;
};

export type FunctionCallAction = BaseFunctionCallActionArgs & {
  actionType: 'FunctionCall';
  functionArgs: Uint8Array;
};

// ******* Function Call Action Creator *********

type BaseSerializeArgs<A> = (args: { functionArgs: A }) => Uint8Array;

type FunctionArgsOf<SA> = SA extends (args: {
  functionArgs: infer T;
}) => Uint8Array
  ? T
  : undefined;

type FunctionArgs<A> = KeyIf<'functionArgs', A>;

export type CreateFunctionCallAction = {
  // #1
  <A extends MaybeJsonLikeValue = undefined>(
    args: BaseFunctionCallActionArgs & FunctionArgs<A> & { options?: never },
  ): FunctionCallAction;
  // #2
  <SA extends BaseSerializeArgs<A>, A = FunctionArgsOf<SA>>(
    args: BaseFunctionCallActionArgs &
      FunctionArgs<A> & { options: { serializeArgs: SA } },
  ): FunctionCallAction;
};

export type InnerCreateFunctionCallActionArgs = BaseFunctionCallActionArgs & {
  functionArgs?: unknown;
  options?: {
    serializeArgs?: BaseSerializeArgs<unknown>;
  };
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
