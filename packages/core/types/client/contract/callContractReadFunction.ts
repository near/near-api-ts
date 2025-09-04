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

export type CallContractReadFunctionArgs<Args> = {
  contractAccountId: AccountId;
  fnName: ContractFunctionName;
  blockReference?: BlockReference;
  // The transformer determines the final result type of the call.
  // If omitted, the result type defaults to `unknown` (output of fromJsonBytes).
  resultTransformer: (rawResult: RawCallResult) => unknown;
  // client?: {
  //   response?: {
  //     resultTransformer?: (rawResult: RawCallResult) => R;
  //   };
  // };
} & FnArgs<Args>;

export type CallContractReadFunctionResult<R> = {
  blockHash: BlockHash;
  blockHeight: BlockHeight;
  logs: string[]; // TODO figure out the proper type
  result: R;
};

type ResT<A> = ReturnType<CallContractReadFunctionArgs<A>['resultTransformer']>

export type CallContractReadFunction = <AJ>(
  args: CallContractReadFunctionArgs<AJ>,
) => Promise<CallContractReadFunctionResult<ResT<AJ>>>;

export type CreateCallContractReadFunction = (
  clientContext: ClientContext,
) => CallContractReadFunction;
