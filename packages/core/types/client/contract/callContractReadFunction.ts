import type {
  AccountId,
  BlockHash,
  BlockHeight,
  BlockReference,
  ContractFunctionName,
  MaybeJsonLikeValue,
} from 'nat-types/common';
import type { ClientContext } from 'nat-types/client/client';
import type { FnArgs } from 'nat-types/contract';

export type RawCallResult = number[];
export type RawCallLogs = string[]; // TODO figure out the proper type

export type BaseTransformFn = (raw: RawCallResult) => unknown;
export type MaybeBaseTransformFn = BaseTransformFn | undefined;

type BaseFnCallArgs = {
  contractAccountId: AccountId;
  fnName: ContractFunctionName;
  blockReference?: BlockReference;
};

type Response<F extends MaybeBaseTransformFn> = [F] extends [BaseTransformFn]
  ? {
      response: {
        resultTransformer: F;
      };
    }
  : {
      response?: {
        resultTransformer?: never;
      };
    };

export type Args<
  AJ extends MaybeJsonLikeValue,
  F extends MaybeBaseTransformFn,
> = Response<F> & BaseFnCallArgs & FnArgs<AJ>;

export type BaseFnCallResult = {
  blockHash: BlockHash;
  blockHeight: BlockHeight;
  logs: RawCallLogs;
};

export type Result<F extends MaybeBaseTransformFn> = [F] extends [
  BaseTransformFn,
]
  ? BaseFnCallResult & { result: ReturnType<F> }
  : BaseFnCallResult & { result: unknown };

export type CallContractReadFunction = <
  AJ extends MaybeJsonLikeValue = undefined,
  F extends MaybeBaseTransformFn = undefined,
>(
  args: Args<AJ, F>,
) => Promise<Result<F>>;

export type CreateCallContractReadFunction = (
  clientContext: ClientContext,
) => CallContractReadFunction;
