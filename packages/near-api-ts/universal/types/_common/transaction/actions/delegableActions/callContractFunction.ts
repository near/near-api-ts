import type { NatError } from '../../../../../src/_common/_common/_common/_common/natError';
import type { KeyIf } from '../../../../utils';
import type { ContractFunctionName, MaybeJsonValue, Result } from '../../../common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../natError';
import type { NearGasArgs } from '../../../nearGas';
import type { NearTokenArgs } from '../../../nearToken';

export interface CreateCallContractFunctionActionPublicErrorRegistry {
  'CreateAction.CallContractFunction.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.CallContractFunction.SerializeArgs.Failed': {
    cause: unknown;
    functionArgs: unknown;
  };
  'CreateAction.CallContractFunction.SerializeArgs.InvalidOutput': { output: unknown };
  'CreateAction.CallContractFunction.Internal': InternalErrorContext;
}

type BaseCallContractFunctionActionArgs = {
  functionName: ContractFunctionName;
  gasLimit: NearGasArgs;
  attachedDeposit?: NearTokenArgs;
};

export type CallContractFunctionAction = {
  actionType: 'CallContractFunction';
  functionName: ContractFunctionName;
  functionArgs: Uint8Array;
  gasLimit: NearGasArgs;
  attachedDeposit?: NearTokenArgs; // TODO fix it - Should be always present
};

// ******* Call Contract Function Action Creator *********

type BaseSerializeArgs<A> = (args: { functionArgs: A }) => Uint8Array;

type FunctionArgsOf<SA> = SA extends (args: { functionArgs: infer T }) => Uint8Array
  ? T
  : undefined;

type FunctionArgs<A> = KeyIf<'functionArgs', A>;

type CreateCallContractFunctionActionError =
  | NatError<'CreateAction.CallContractFunction.Args.InvalidSchema'>
  | NatError<'CreateAction.CallContractFunction.SerializeArgs.InvalidOutput'>
  | NatError<'CreateAction.CallContractFunction.SerializeArgs.Failed'>
  | NatError<'CreateAction.CallContractFunction.Internal'>;

export type SafeCreateCallContractFunctionAction = {
  // #1
  <A extends MaybeJsonValue = undefined>(
    args: BaseCallContractFunctionActionArgs & FunctionArgs<A> & { options?: never },
  ): Result<CallContractFunctionAction, CreateCallContractFunctionActionError>;
  // #2
  <SA extends BaseSerializeArgs<A>, A = FunctionArgsOf<SA>>(
    args: BaseCallContractFunctionActionArgs & FunctionArgs<A> & { options: { serializeArgs: SA } },
  ): Result<CallContractFunctionAction, CreateCallContractFunctionActionError>;
};

export type CreateCallContractFunctionAction = {
  // #1
  <A extends MaybeJsonValue = undefined>(
    args: BaseCallContractFunctionActionArgs & FunctionArgs<A> & { options?: never },
  ): CallContractFunctionAction;
  // #2
  <SA extends BaseSerializeArgs<A>, A = FunctionArgsOf<SA>>(
    args: BaseCallContractFunctionActionArgs & FunctionArgs<A> & { options: { serializeArgs: SA } },
  ): CallContractFunctionAction;
};

export type InnerCreateCallContractFunctionActionArgs = BaseCallContractFunctionActionArgs & {
  functionArgs?: unknown;
  options?: {
    serializeArgs?: BaseSerializeArgs<unknown>;
  };
};

// ****** NEARCORE ********

export type NearcoreCallContractFunctionAction = {
  functionCall: {
    methodName: string;
    args: Uint8Array;
    gas: bigint;
    deposit: bigint;
  };
};
