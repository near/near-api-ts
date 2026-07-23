import type { NatError } from '../../src/_common/natError';
import { type RepackTargetPrefixError, repackError } from '../../src/_common/utils/repackError';
import type { ResultErr } from '../../types/_common/common';
import type { GetAccountInfoError } from '../../types/client/methods/account/getAccountInfo';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

declare const sendRequestError:
  | NatError<'SendRequest.PreferredRpc.NotFound'>
  | NatError<'SendRequest.Timeout'>
  | NatError<'SendRequest.Aborted'>
  | NatError<'SendRequest.Exhausted'>;

const repacked = repackError({
  error: sendRequestError,
  originPrefix: 'SendRequest',
  targetPrefix: 'Client.GetAccountInfo',
});

type _KindsAreMapped = Expect<
  Equal<
    (typeof repacked)['error']['kind'],
    | 'Client.GetAccountInfo.PreferredRpc.NotFound'
    | 'Client.GetAccountInfo.Timeout'
    | 'Client.GetAccountInfo.Aborted'
    | 'Client.GetAccountInfo.Exhausted'
  >
>;

// The kind <-> context correlation survives the repack
type _TimeoutContextIsCorrelated = Expect<
  Equal<
    Extract<(typeof repacked)['error'], { kind: 'Client.GetAccountInfo.Timeout' }>['context'],
    NatError<'SendRequest.Timeout'>['context']
  >
>;

type _ExhaustedContextIsCorrelated = Expect<
  Equal<
    Extract<(typeof repacked)['error'], { kind: 'Client.GetAccountInfo.Exhausted' }>['context'],
    NatError<'SendRequest.Exhausted'>['context']
  >
>;

// A valid repack is assignable to the method's declared error union - the guard must not over-fire
const _repackedIsAssignable: ResultErr<GetAccountInfoError> = repacked;

// A single error (not a union) keeps working
declare const singleError: NatError<'SendRequest.Timeout'>;

const repackedSingle = repackError({
  error: singleError,
  originPrefix: 'SendRequest',
  targetPrefix: 'Client.GetAccountInfo',
});

type _SingleKindIsMapped = Expect<
  Equal<(typeof repackedSingle)['error']['kind'], 'Client.GetAccountInfo.Timeout'>
>;

// A multi-segment originPrefix is replaced as a whole, not segment by segment
declare const transactionDetailsError:
  | NatError<'Inner.Client.TransactionDetails.DeserializeResultData.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed'>;

const repackedDeepPrefix = repackError({
  error: transactionDetailsError,
  originPrefix: 'Inner.Client.TransactionDetails',
  targetPrefix: 'Client.GetTransactionResult',
});

type _DeepOriginPrefixIsMapped = Expect<
  Equal<
    (typeof repackedDeepPrefix)['error']['kind'],
    | 'Client.GetTransactionResult.DeserializeResultData.Failed'
    | 'Client.GetTransactionResult.DeserializeExecutionSteps.Failed'
  >
>;

repackError({
  error: sendRequestError,
  // @ts-expect-error - 'SendRequestt' is not a prefix of the error kind
  originPrefix: 'SendRequestt',
  targetPrefix: 'Client.GetAccountInfo',
});

repackError({
  error: sendRequestError,
  // @ts-expect-error - 'SendRequest.Attempt' is a prefix of other kinds, not of these ones
  originPrefix: 'SendRequest.Attempt',
  targetPrefix: 'Client.GetAccountInfo',
});

// --- targetPrefix validation ---
//
// Every produced kind is checked against the registry. We can't report an unregistered
// target by narrowing the union down to `never`: `ResultErr<never>` is assignable to every
// `ResultErr<...>`, so the call site would stay silently green. This documents that trap:
declare const errUnion: ResultErr<never>;
const _neverIsAssignableToAnything: ResultErr<GetAccountInfoError> = errUnion;

// A target prefix nobody registered
const repackedWithUnknownTarget = repackError({
  error: sendRequestError,
  originPrefix: 'SendRequest',
  targetPrefix: 'Client.NotAMethod',
});

type _UnregisteredTargetIsReported = Expect<
  Equal<
    typeof repackedWithUnknownTarget,
    RepackTargetPrefixError<
      | 'Client.NotAMethod.PreferredRpc.NotFound'
      | 'Client.NotAMethod.Timeout'
      | 'Client.NotAMethod.Aborted'
      | 'Client.NotAMethod.Exhausted'
    >
  >
>;

// @ts-expect-error - the diagnostic is not a Result, so returning it breaks the call site
const _unknownTargetIsNotAResult: ResultErr<GetAccountInfoError> = repackedWithUnknownTarget;

// A target prefix that is a real registry prefix, but one segment too deep:
// 'Client.GetAccountInfo.StoragePricePerByte.NotLoaded' exists, '...StoragePricePerByte.Timeout' doesn't
const repackedWithTooDeepTarget = repackError({
  error: sendRequestError,
  originPrefix: 'SendRequest',
  targetPrefix: 'Client.GetAccountInfo.StoragePricePerByte',
});

type _TooDeepTargetIsReported = Expect<
  Equal<
    typeof repackedWithTooDeepTarget,
    RepackTargetPrefixError<
      | 'Client.GetAccountInfo.StoragePricePerByte.PreferredRpc.NotFound'
      | 'Client.GetAccountInfo.StoragePricePerByte.Timeout'
      | 'Client.GetAccountInfo.StoragePricePerByte.Aborted'
      | 'Client.GetAccountInfo.StoragePricePerByte.Exhausted'
    >
  >
>;
