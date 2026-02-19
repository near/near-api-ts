import type {
  ContractFunctionName,
  MaybeJsonLikeValue,
  Result,
} from '../_common/common';
import type { KeyIf } from '../utils';
import type { NearTokenArgs } from '../_common/nearToken';
import type { NearGasArgs } from '../_common/nearGas';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../natError';
import type { NatError } from '../../src/_common/natError';

export interface CreateFunctionCallActionPublicErrorRegistry {
  'CreateAction.FunctionCall.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.FunctionCall.SerializeArgs.Internal': InternalErrorContext;
  'CreateAction.FunctionCall.SerializeArgs.InvalidOutput': { output: unknown };
  'CreateAction.FunctionCall.Internal': InternalErrorContext;
}

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

type CreateFunctionCallActionError =
  | NatError<'CreateAction.FunctionCall.Args.InvalidSchema'>
  | NatError<'CreateAction.FunctionCall.SerializeArgs.InvalidOutput'>
  | NatError<'CreateAction.FunctionCall.SerializeArgs.Internal'>
  | NatError<'CreateAction.FunctionCall.Internal'>;

export type SafeCreateFunctionCallAction = {
  // #1
  <A extends MaybeJsonLikeValue = undefined>(
    args: BaseFunctionCallActionArgs & FunctionArgs<A> & { options?: never },
  ): Result<FunctionCallAction, CreateFunctionCallActionError>;
  // #2
  <SA extends BaseSerializeArgs<A>, A = FunctionArgsOf<SA>>(
    args: BaseFunctionCallActionArgs &
      FunctionArgs<A> & { options: { serializeArgs: SA } },
  ): Result<FunctionCallAction, CreateFunctionCallActionError>;
};

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
