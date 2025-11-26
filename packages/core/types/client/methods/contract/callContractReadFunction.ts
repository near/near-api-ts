import type {
  AccountId,
  BlockHash,
  BlockHeight,
  BlockReference,
  ContractFunctionName,
  MaybeJsonLikeValue,
} from 'nat-types/_common/common';
import type { ClientContext } from 'nat-types/client/client';
import type { KeyIf, Prettify } from 'nat-types/utils';
import type { PartialTransportPolicy } from 'nat-types/client/transport';

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

export type Result<R> = Prettify<{
  blockHash: BlockHash;
  blockHeight: BlockHeight;
  logs: RawCallLogs;
  result: R;
}>;

type CallResult<DR extends MaybeBaseDeserializeResult> = [DR] extends [
  BaseDeserializeResult,
]
  ? Promise<Result<ReturnType<DR>>>
  : Promise<Result<unknown>>;

// Return type of functionArgs or undefined
type FunctionArgsOf<SA> = SA extends (args: {
  functionArgs: infer T;
}) => Uint8Array
  ? T
  : undefined;

export type CallContractReadFunction = {
  // #1
  <A extends MaybeJsonLikeValue = undefined>(
    args: BaseFnCallArgs &
      FunctionArgs<A> &
      Options<undefined, undefined, undefined>,
  ): CallResult<undefined>;
  // #2
  <DR extends BaseDeserializeResult, A extends MaybeJsonLikeValue = undefined>(
    args: BaseFnCallArgs & FunctionArgs<A> & Options<undefined, undefined, DR>,
  ): CallResult<DR>;
  // #3
  <
    SA extends BaseSerializeArgs<A>,
    DR extends MaybeBaseDeserializeResult = undefined,
    A = FunctionArgsOf<SA>,
  >(
    args: BaseFnCallArgs & FunctionArgs<A> & Options<A, SA, DR>,
  ): CallResult<DR>;
};

export type CreateCallContractReadFunction = (
  clientContext: ClientContext,
) => CallContractReadFunction;
