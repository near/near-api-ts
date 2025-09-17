import type {
  AccountId,
  BlockHash,
  BlockHeight,
  BlockReference,
  ContractFunctionName,
  JsonLikeValue,
  MaybeJsonLikeValue,
} from 'nat-types/common';
import type { ClientContext } from 'nat-types/client/client';
import type { KeyIf, Prettify } from 'nat-types/utils';

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
};

export type InnerCallContractReadFunctionArgs = BaseFnCallArgs & {
  functionArgs?: unknown;
  options?: {
    serializeArgs?: BaseSerializeArgs<unknown>;
    deserializeResult?: BaseDeserializeResult;
  };
};

type Options<
  A,
  SR extends BaseSerializeArgs<A> | undefined,
  DR extends MaybeBaseDeserializeResult,
> = [SR, DR] extends [undefined, undefined]
  ? {
      options?: never;
    }
  : {
      options: KeyIf<'serializeArgs', SR> & KeyIf<'deserializeResult', DR>;
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

export type CallContractReadFunction = {
  // #1: Has only JSON-like or undefined functionArgs
  <A extends MaybeJsonLikeValue = undefined>(
    args: BaseFnCallArgs &
      FunctionArgs<A> &
      Options<undefined, undefined, undefined>,
  ): CallResult<undefined>;

  // #2: Has only custom deserializeResult
  <DR extends BaseDeserializeResult>(
    args: BaseFnCallArgs &
      FunctionArgs<undefined> &
      Options<undefined, undefined, DR>,
  ): CallResult<DR>;

  // #3: Has JSON-like functionArgs and custom deserializeResult
  <A extends JsonLikeValue, DR extends BaseDeserializeResult>(
    args: BaseFnCallArgs & FunctionArgs<A> & Options<undefined, undefined, DR>,
  ): CallResult<DR>;

  // #4: Has custom serializeArgs and functionArgs === serializeArgs.args.functionArgs.
  // Also, may have custom deserializeResult;
  <
    A,
    SA extends BaseSerializeArgs<A>,
    DR extends MaybeBaseDeserializeResult = undefined,
  >(
    args: BaseFnCallArgs & FunctionArgs<A> & Options<A, SA, DR>,
  ): CallResult<DR>;
};

export type CreateCallContractReadFunction = (
  clientContext: ClientContext,
) => CallContractReadFunction;
