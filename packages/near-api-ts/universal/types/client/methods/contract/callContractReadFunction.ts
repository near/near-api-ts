import type {
  AccountId,
  BlockHash,
  BlockHeight,
  BlockReference,
  ContractFunctionName,
  MaybeJsonLikeValue,
  Result,
} from '../../../_common/common';
import type { ClientContext } from '../../client';
import type { KeyIf } from '../../../utils';
import type { PartialTransportPolicy } from '../../transport/transport';
import type {
  RpcQueryBlockGarbageCollectedErrorContext,
  RpcQueryBlockNotFoundErrorContext,
  RpcQueryNotSyncedErrorContext,
  RpcQueryShardNotTrackedErrorContext,
} from '../_common/common';
import type { NatError } from '../../../../src/_common/natError';
import type {
  InternalErrorContext,
  InvalidSchemaErrorContext,
} from '../../../natError';
import type {
  AbortedErrorContext,
  ExhaustedErrorContext,
  PreferredRpcNotFoundErrorContext,
  TimeoutErrorContext,
} from '@universal/types/client/transport/sendRequest';

export interface CallContractReadFunctionPublicErrorRegistry {
  'Client.CallContractReadFunction.Args.InvalidSchema': InvalidSchemaErrorContext;
  'Client.CallContractReadFunction.SerializeArgs.Internal': InternalErrorContext;
  'Client.CallContractReadFunction.SerializeArgs.InvalidOutput': {
    output: unknown;
  };
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

export type BaseDeserializeResult = ({
  rawResult,
}: {
  rawResult: RawCallResult;
}) => unknown;

type MaybeBaseDeserializeResult = BaseDeserializeResult | undefined;

type BaseSerializeArgs<A> = (args: { functionArgs: A }) => Uint8Array;

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
    serializeArgs?: BaseSerializeArgs<unknown>;
    deserializeResult?: BaseDeserializeResult;
  };
};

type BaseOptions = {
  signal?: AbortSignal;
};

type Options<
  A,
  SR extends BaseSerializeArgs<A> | undefined,
  DR extends MaybeBaseDeserializeResult,
> = [SR, DR] extends [undefined, undefined]
  ? {
      options?: BaseOptions;
    }
  : {
      options: BaseOptions &
        KeyIf<'serializeArgs', SR> &
        KeyIf<'deserializeResult', DR>;
    };

type FunctionArgs<A> = KeyIf<'functionArgs', A>;

export type Output<R> = {
  blockHash: BlockHash;
  blockHeight: BlockHeight;
  result: R;
  rawResult: RawCallResult;
  logs: RawCallLogs;
};

// Return type of functionArgs or undefined
type FunctionArgsOf<SA> = SA extends (args: {
  functionArgs: infer T;
}) => Uint8Array
  ? T
  : undefined;

type CallContractReadFunctionError =
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
type SafeCallOutput<DR extends MaybeBaseDeserializeResult> = [DR] extends [
  BaseDeserializeResult,
]
  ? Promise<Result<Output<ReturnType<DR>>, CallContractReadFunctionError>>
  : Promise<Result<Output<unknown>, CallContractReadFunctionError>>;

export type SafeCallContractReadFunction = {
  // #1
  <A extends MaybeJsonLikeValue = undefined>(
    args: BaseFnCallArgs &
      FunctionArgs<A> &
      Options<undefined, undefined, undefined>,
  ): SafeCallOutput<undefined>;
  // #2
  <DR extends BaseDeserializeResult, A extends MaybeJsonLikeValue = undefined>(
    args: BaseFnCallArgs & FunctionArgs<A> & Options<undefined, undefined, DR>,
  ): SafeCallOutput<DR>;
  // #3
  <
    SA extends BaseSerializeArgs<A>,
    DR extends MaybeBaseDeserializeResult = undefined,
    A = FunctionArgsOf<SA>,
  >(
    args: BaseFnCallArgs & FunctionArgs<A> & Options<A, SA, DR>,
  ): SafeCallOutput<DR>;
};

// Throwable method
type CallOutput<DR extends MaybeBaseDeserializeResult> = [DR] extends [
  BaseDeserializeResult,
]
  ? Promise<Output<ReturnType<DR>>>
  : Promise<Output<unknown>>;

export type CallContractReadFunction = {
  // #1
  <A extends MaybeJsonLikeValue = undefined>(
    args: BaseFnCallArgs &
      FunctionArgs<A> &
      Options<undefined, undefined, undefined>,
  ): CallOutput<undefined>;
  // #2
  <DR extends BaseDeserializeResult, A extends MaybeJsonLikeValue = undefined>(
    args: BaseFnCallArgs & FunctionArgs<A> & Options<undefined, undefined, DR>,
  ): CallOutput<DR>;
  // #3
  <
    SA extends BaseSerializeArgs<A>,
    DR extends MaybeBaseDeserializeResult = undefined,
    A = FunctionArgsOf<SA>,
  >(
    args: BaseFnCallArgs & FunctionArgs<A> & Options<A, SA, DR>,
  ): CallOutput<DR>;
};

// Create method
export type CreateSafeCallContractReadFunction = (
  clientContext: ClientContext,
) => SafeCallContractReadFunction;
