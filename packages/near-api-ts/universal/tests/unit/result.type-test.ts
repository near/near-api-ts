import { result } from '../../src/_common/_common/_common/result';
import { asThrowable } from '../../src/_common/_common/asThrowable';
import type { Result, ResultErr, ResultOk } from '../../types/_common/common';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

type _SuccessShape = Expect<
  Equal<ResultOk<string>, { success: true; data: string; error?: never }>
>;
type _FailureShape = Expect<
  Equal<ResultErr<Error>, { success: false; error: Error; data?: never }>
>;

declare const outcome: Result<string, Error>;

type _DataBeforeNarrowing = Expect<Equal<typeof outcome.data, string | undefined>>;
type _ErrorBeforeNarrowing = Expect<Equal<typeof outcome.error, Error | undefined>>;

if (outcome.success) {
  type _Data = Expect<Equal<typeof outcome.data, string>>;
  type _Error = Expect<Equal<typeof outcome.error, undefined>>;
} else {
  type _Data = Expect<Equal<typeof outcome.data, undefined>>;
  type _Error = Expect<Equal<typeof outcome.error, Error>>;
}

const { success, data, error } = outcome;

if (success) {
  type _Data = Expect<Equal<typeof data, string>>;
  type _Error = Expect<Equal<typeof error, undefined>>;
} else {
  type _Data = Expect<Equal<typeof data, undefined>>;
  type _Error = Expect<Equal<typeof error, Error>>;
}

const _success: Result<string, Error> = { success: true, data: 'value' };
const _failure: Result<string, Error> = { success: false, error: new Error('failed') };
const _undefinedData: Result<undefined, Error> = { success: true, data: undefined };
const _undefinedError: Result<string, undefined> = { success: false, error: undefined };

// @ts-expect-error - a successful result requires data
const _missingData: Result<string, Error> = { success: true };
// @ts-expect-error - a failed result requires an error
const _missingError: Result<string, Error> = { success: false };
// @ts-expect-error - a successful result cannot also carry an error
const _successWithError: Result<string, Error> = {
  success: true,
  data: 'value',
  error: new Error(),
};
// @ts-expect-error - a failed result cannot also carry data
const _failureWithData: Result<string, Error> = {
  success: false,
  error: new Error(),
  data: 'value',
};
// @ts-expect-error - the old shape is no longer supported
const _oldShape: Result<string, Error> = { ok: true, value: 'value' };

const successResult = result.ok('value');
const errorResult = result.err(new Error('failed'));

type _SuccessConstructor = Expect<Equal<typeof successResult, ResultOk<string>>>;
type _FailureConstructor = Expect<Equal<typeof errorResult, ResultErr<Error>>>;

declare const safeSync: (input: number) => Result<string, Error>;
declare const safeAsync: (input: number) => Promise<Result<string, Error>>;

const throwingSync = asThrowable(safeSync);
const throwingAsync = asThrowable(safeAsync);

type _SyncSignature = Expect<Equal<typeof throwingSync, (input: number) => string>>;
type _AsyncSignature = Expect<Equal<typeof throwingAsync, (input: number) => Promise<string>>>;
