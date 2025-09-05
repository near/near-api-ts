import type {
  AccountId,
  BlockHash,
  BlockHeight,
  BlockReference,
  ContractFunctionName,
} from 'nat-types/common';
import type { ClientContext } from 'nat-types/client/client';
import type { FnArgs } from 'nat-types/contract';

export type RawCallResult = number[];
export type BaseTransformFn = (raw: RawCallResult) => unknown;

type BaseFnCallArgs = {
  contractAccountId: AccountId;
  fnName: ContractFunctionName;
  blockReference?: BlockReference;
};

export type Args<A, F extends BaseTransformFn | undefined> = [F] extends [
  BaseTransformFn,
]
  ? BaseFnCallArgs & FnArgs<A> & { resultTransformer: F }
  : BaseFnCallArgs & FnArgs<A> & { resultTransformer?: never };

export type BaseFnCallResult = {
  blockHash: BlockHash;
  blockHeight: BlockHeight;
  logs: string[]; // TODO figure out the proper type
};

export type Result<F extends BaseTransformFn | undefined> = [F] extends [
  BaseTransformFn,
]
  ? BaseFnCallResult & { result: ReturnType<F> }
  : BaseFnCallResult & { result: unknown };

// Overload order matters
export type CallContractReadFunction = {
  // #1
  <A, F extends BaseTransformFn | undefined>(
    args: Args<A, F>,
  ): Promise<Result<F>>;
  // #2
  <F extends BaseTransformFn>(
    args: Args<undefined, F>,
  ): Promise<Result<F>>;
  // #3
  <A>(args: Args<A, undefined>): Promise<Result<undefined>>;
  // #4
  (args: Args<undefined, undefined>): Promise<Result<undefined>>;
};

export type CreateCallContractReadFunction = (
  clientContext: ClientContext,
) => CallContractReadFunction;
