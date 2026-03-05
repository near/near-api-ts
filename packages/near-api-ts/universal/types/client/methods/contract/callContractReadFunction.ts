import type { NatError } from '@universal/src/_common/natError';
import type {
  AbortedErrorContext,
  ExhaustedErrorContext,
  PreferredRpcNotFoundErrorContext,
  TimeoutErrorContext,
} from '@universal/types/client/transport/sendRequest';
import type {
  AccountId,
  BlockHash,
  BlockHeight,
  BlockReference,
  ContractFunctionName,
  MaybeJsonLikeValue,
  Result,
} from '../../../_common/common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../natError';
import type { KeyIf } from '../../../utils';
import type { ClientContext } from '../../client';
import type { PartialTransportPolicy } from '../../transport/transport';
import type {
  RpcQueryBlockGarbageCollectedErrorContext,
  RpcQueryBlockNotFoundErrorContext,
  RpcQueryNotSyncedErrorContext,
  RpcQueryShardNotTrackedErrorContext,
} from '../_common/common';

export interface CallContractReadFunctionPublicErrorRegistry {
  'Client.CallContractReadFunction.Args.InvalidSchema': InvalidSchemaErrorContext;
  'Client.CallContractReadFunction.SerializeArgs.Internal': InternalErrorContext;
  'Client.CallContractReadFunction.SerializeArgs.InvalidOutput': { output: unknown };
  'Client.CallContractReadFunction.PreferredRpc.NotFound': PreferredRpcNotFoundErrorContext;
  'Client.CallContractReadFunction.Timeout': TimeoutErrorContext;
  'Client.CallContractReadFunction.Aborted': AbortedErrorContext;
  'Client.CallContractReadFunction.Exhausted': ExhaustedErrorContext;
  'Client.CallContractReadFunction.Rpc.NotSynced': RpcQueryNotSyncedErrorContext;
  'Client.CallContractReadFunction.Rpc.Shard.NotTracked': RpcQueryShardNotTrackedErrorContext;
  'Client.CallContractReadFunction.Rpc.Block.GarbageCollected': RpcQueryBlockGarbageCollectedErrorContext;
  'Client.CallContractReadFunction.Rpc.Block.NotFound': RpcQueryBlockNotFoundErrorContext;
  'Client.CallContractReadFunction.Rpc.Execution.Failed': {
    contractAccountId: AccountId;
    message: string;
    blockHash: BlockHash;
    blockHeight: BlockHeight;
  };
  'Client.CallContractReadFunction.DeserializeResult.Internal': InternalErrorContext;
  'Client.CallContractReadFunction.Internal': InternalErrorContext;
}

export type RawCallResult = number[];
export type RawCallLogs = string[];

export type DeserializeResultFnArgs = { rawResult: RawCallResult };
export type BaseDeserializeResultFn = (args: DeserializeResultFnArgs) => unknown;
export type MaybeBaseDeserializeResultFn = BaseDeserializeResultFn | undefined;

export type BaseSerializeArgsFn<A> = (args: { functionArgs: A }) => Uint8Array;
export type MaybeBaseSerializeArgsFn<A> = BaseSerializeArgsFn<A> | undefined;

type BaseFnCallArgs = {
  contractAccountId: AccountId;
  functionName: ContractFunctionName;
  withStateAt?: BlockReference;
  policies?: {
    transport?: PartialTransportPolicy;
  };
};

export type InnerCallContractReadFunctionArgs = BaseFnCallArgs & {
  functionArgs?: unknown;
  options?: {
    signal?: AbortSignal;
    serializeArgs?: BaseSerializeArgsFn<unknown>;
    deserializeResult?: BaseDeserializeResultFn;
  };
};

type BaseOptions = {
  signal?: AbortSignal;
};

type Options<A, SR extends MaybeBaseSerializeArgsFn<A>, DR extends MaybeBaseDeserializeResultFn> = [
  SR,
  DR,
] extends [undefined, undefined]
  ? {
      options?: BaseOptions;
    }
  : {
      options: BaseOptions & KeyIf<'serializeArgs', SR> & KeyIf<'deserializeResult', DR>;
    };

type FunctionArgs<A> = KeyIf<'functionArgs', A>;

export type CallContractReadFunctionOutput<R> = {
  blockHash: BlockHash;
  blockHeight: BlockHeight;
  result: R;
  rawResult: RawCallResult;
  logs: RawCallLogs;
};

// Return type of functionArgs or undefined
type FunctionArgsOf<SA> = SA extends (args: { functionArgs: infer T }) => Uint8Array
  ? T
  : undefined;

export type CallContractReadFunctionError =
  | NatError<'Client.CallContractReadFunction.Args.InvalidSchema'>
  // SerializeArgs
  | NatError<'Client.CallContractReadFunction.SerializeArgs.InvalidOutput'>
  | NatError<'Client.CallContractReadFunction.SerializeArgs.Internal'>
  // Send request
  | NatError<'Client.CallContractReadFunction.PreferredRpc.NotFound'>
  | NatError<'Client.CallContractReadFunction.Timeout'>
  | NatError<'Client.CallContractReadFunction.Aborted'>
  | NatError<'Client.CallContractReadFunction.Exhausted'>
  // RPC
  | NatError<'Client.CallContractReadFunction.Rpc.NotSynced'>
  | NatError<'Client.CallContractReadFunction.Rpc.Shard.NotTracked'>
  | NatError<'Client.CallContractReadFunction.Rpc.Block.GarbageCollected'>
  | NatError<'Client.CallContractReadFunction.Rpc.Block.NotFound'>
  // TODO add contract not found
  | NatError<'Client.CallContractReadFunction.Rpc.Execution.Failed'>
  //
  | NatError<'Client.CallContractReadFunction.DeserializeResult.Internal'>
  | NatError<'Client.CallContractReadFunction.Internal'>;

// Safe method
type SafeCallOutput<DR extends MaybeBaseDeserializeResultFn> = [DR] extends [
  BaseDeserializeResultFn,
]
  ? Promise<Result<CallContractReadFunctionOutput<ReturnType<DR>>, CallContractReadFunctionError>>
  : Promise<Result<CallContractReadFunctionOutput<unknown>, CallContractReadFunctionError>>;

export type SafeCallContractReadFunction = {
  // #1
  <A extends MaybeJsonLikeValue = undefined>(
    args: BaseFnCallArgs & FunctionArgs<A> & Options<undefined, undefined, undefined>,
  ): SafeCallOutput<undefined>;
  // #2
  <DR extends BaseDeserializeResultFn, A extends MaybeJsonLikeValue = undefined>(
    args: BaseFnCallArgs & FunctionArgs<A> & Options<undefined, undefined, DR>,
  ): SafeCallOutput<DR>;
  // #3
  <
    SA extends BaseSerializeArgsFn<A>,
    DR extends MaybeBaseDeserializeResultFn = undefined,
    A = FunctionArgsOf<SA>,
  >(
    args: BaseFnCallArgs & FunctionArgs<A> & Options<A, SA, DR>,
  ): SafeCallOutput<DR>;
};

// Throwable method
type CallOutput<DR extends MaybeBaseDeserializeResultFn> = [DR] extends [BaseDeserializeResultFn]
  ? Promise<CallContractReadFunctionOutput<ReturnType<DR>>>
  : Promise<CallContractReadFunctionOutput<unknown>>;

export type CallContractReadFunction = {
  // #1
  <A extends MaybeJsonLikeValue = undefined>(
    args: BaseFnCallArgs & FunctionArgs<A> & Options<undefined, undefined, undefined>,
  ): CallOutput<undefined>;
  // #2
  <DR extends BaseDeserializeResultFn, A extends MaybeJsonLikeValue = undefined>(
    args: BaseFnCallArgs & FunctionArgs<A> & Options<undefined, undefined, DR>,
  ): CallOutput<DR>;
  // #3
  <
    SA extends BaseSerializeArgsFn<A>,
    DR extends MaybeBaseDeserializeResultFn = undefined,
    A = FunctionArgsOf<SA>,
  >(
    args: BaseFnCallArgs & FunctionArgs<A> & Options<A, SA, DR>,
  ): CallOutput<DR>;
};

// Create method
export type CreateSafeCallContractReadFunction = (
  clientContext: ClientContext,
) => SafeCallContractReadFunction;
