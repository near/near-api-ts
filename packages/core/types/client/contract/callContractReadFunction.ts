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
export type RawCallLogs = string[];

export type BaseResultTransformer = ({
  rawResult,
}: {
  rawResult: RawCallResult;
}) => unknown;

export type MaybeBaseResultTransformer = BaseResultTransformer | undefined;

type BaseFnCallArgs = {
  contractAccountId: AccountId;
  fnName: ContractFunctionName;
  blockReference?: BlockReference;
};

type Response<F extends MaybeBaseResultTransformer> = [F] extends [
  BaseResultTransformer,
]
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
  F extends MaybeBaseResultTransformer,
> = Response<F> & BaseFnCallArgs & FnArgs<AJ>;

export type BaseFnCallResult = {
  blockHash: BlockHash;
  blockHeight: BlockHeight;
  logs: RawCallLogs;
};

export type Result<F extends MaybeBaseResultTransformer> = [F] extends [
  BaseResultTransformer,
]
  ? BaseFnCallResult & { result: ReturnType<F> }
  : BaseFnCallResult & { result: unknown };

export type CallContractReadFunction = <
  AJ extends MaybeJsonLikeValue = undefined,
  F extends MaybeBaseResultTransformer = undefined,
>(
  args: Args<AJ, F>,
) => Promise<Result<F>>;

export type CreateCallContractReadFunction = (
  clientContext: ClientContext,
) => CallContractReadFunction;
