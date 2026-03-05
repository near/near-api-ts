import type { UseQueryResult } from '@tanstack/react-query';
import type {
  AccountId,
  BaseDeserializeResultFn,
  BaseSerializeArgsFn,
  BlockReference,
  CallContractReadFunctionError,
  CallContractReadFunctionOutput,
  MaybeBaseDeserializeResultFn,
  MaybeBaseSerializeArgsFn,
  MaybeJsonLikeValue,
  PartialTransportPolicy,
} from 'near-api-ts';
import type { KeyIf } from '../common.ts';

export type BaseUseContractReadFunctionArgs = {
  contractAccountId: AccountId;
  functionName: string;
  withStateAt?: BlockReference;
  policies?: {
    transport?: PartialTransportPolicy;
  };
  query?: {
    enabled?: boolean;
  };
};

export type InnerUseContractReadFunctionArgs = BaseUseContractReadFunctionArgs & {
  functionArgs?: any;
  options?: {
    signal?: AbortSignal;
    serializeArgs?: BaseSerializeArgsFn<any>;
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

// Return type of functionArgs or undefined
type FunctionArgsOf<SA> = SA extends (args: { functionArgs: infer T }) => Uint8Array
  ? T
  : undefined;

type CallOutput<DR extends MaybeBaseDeserializeResultFn> = [DR] extends [BaseDeserializeResultFn]
  ? CallContractReadFunctionOutput<ReturnType<DR>>
  : CallContractReadFunctionOutput<unknown>;

type FunctionArgs<A> = KeyIf<'functionArgs', A>;

export type UseContractReadFunction = {
  // #1
  <A extends MaybeJsonLikeValue = undefined>(
    args: BaseUseContractReadFunctionArgs &
      FunctionArgs<A> &
      Options<undefined, undefined, undefined>,
  ): UseQueryResult<CallOutput<undefined>, CallContractReadFunctionError>;
  // #2
  <DR extends BaseDeserializeResultFn, A extends MaybeJsonLikeValue = undefined>(
    args: BaseUseContractReadFunctionArgs & FunctionArgs<A> & Options<undefined, undefined, DR>,
  ): UseQueryResult<CallOutput<DR>, CallContractReadFunctionError>;
  // #3
  <
    SA extends BaseSerializeArgsFn<A>,
    DR extends MaybeBaseDeserializeResultFn = undefined,
    A = FunctionArgsOf<SA>,
  >(
    args: BaseUseContractReadFunctionArgs & FunctionArgs<A> & Options<A, SA, DR>,
  ): UseQueryResult<CallOutput<DR>, CallContractReadFunctionError>;
};
