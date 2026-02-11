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
import type { CommonRpcMethodErrorVariant } from '../_common/common';
import type { CommonRpcQueryMethodErrorVariant } from '../_common/query';
import type { NatError } from '../../../../src/_common/natError';
import type { InternalErrorContext } from '../../../natError';

export type CallContractReadFunctionErrorVariant =
  | CommonRpcMethodErrorVariant<'Client.CallContractReadFunction'>
  | CommonRpcQueryMethodErrorVariant<'Client.CallContractReadFunction'>
  | {
      kind: 'Client.CallContractReadFunction.SerializeArgs.Internal';
      context: InternalErrorContext;
    }
  | {
      kind: 'Client.CallContractReadFunction.SerializeArgs.InvalidOutput';
      context: { output: unknown };
    }
  | {
      kind: 'Client.CallContractReadFunction.Rpc.Execution.Failed';
      context: {
        contractAccountId: AccountId;
        message: string;
        blockHash: BlockHash;
        blockHeight: BlockHeight;
      };
    }
  | {
      kind: 'Client.CallContractReadFunction.DeserializeResult.Internal';
      context: InternalErrorContext;
    };

export type CallContractReadFunctionInternalErrorKind =
  | 'Client.CallContractReadFunction.SerializeArgs.Internal'
  | 'Client.CallContractReadFunction.DeserializeResult.Internal'
  | 'Client.CallContractReadFunction.Internal';

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
  | NatError<'Client.CallContractReadFunction.SerializeArgs.InvalidOutput'>
  | NatError<'Client.CallContractReadFunction.SerializeArgs.Internal'>
  | NatError<'Client.CallContractReadFunction.SendRequest.Failed'>
  // RPC
  | NatError<'Client.CallContractReadFunction.Rpc.NotSynced'>
  | NatError<'Client.CallContractReadFunction.Rpc.Shard.NotTracked'>
  | NatError<'Client.CallContractReadFunction.Rpc.Block.GarbageCollected'>
  | NatError<'Client.CallContractReadFunction.Rpc.Block.NotFound'>
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
