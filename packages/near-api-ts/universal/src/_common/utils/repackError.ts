import type { ResultErr } from '../../../types/_common/common';
import type { ContextFor, NatErrorKind } from '../../../types/_common/natError';
import { createNatError, type NatError } from '../natError';
import { result } from './result';

// All dot-separated prefixes of an error kind:
// 'Client.Transport.SendRequest' -> 'Client' | 'Client.Transport' | 'Client.Transport.SendRequest'
type ErrorKindPrefix<K extends string> = K extends `${infer Head}.${infer Rest}`
  ? Head | `${Head}.${ErrorKindPrefix<Rest>}`
  : never;

// Kinds we get after the prefix replacement, before we check them against the registry
type MappedErrorKind<
  K extends NatErrorKind,
  O extends string,
  T extends string,
> = K extends `${O}.${infer Suffix}` ? `${T}.${Suffix}` : never;

type RepackedErrorKind<K extends NatErrorKind, O extends string, T extends string> = Extract<
  MappedErrorKind<K, O, T>,
  NatErrorKind
>;

type UnregisteredErrorKind<K extends NatErrorKind, O extends string, T extends string> = Exclude<
  MappedErrorKind<K, O, T>,
  NatErrorKind
>;

// The context stays the same, we only replace the kind prefix, so we keep both correlated:
// NatError<'A', ContextA> | NatError<'B', ContextB>, not NatError<'A' | 'B', ContextA | ContextB>
type RepackedError<E extends NatError<NatErrorKind>, O extends string, T extends string> =
  E extends NatError<infer K, infer C>
    ? RepackedErrorKind<K, O, T> extends infer NK extends NatErrorKind
      ? NK extends NK
        ? NatError<NK, C & ContextFor<NK>>
        : never
      : never
    : never;

// A wrong targetPrefix would otherwise produce `never`, and `ResultErr<never>` is assignable
// to any `ResultErr<...>` - so we return a non-Result shape instead to break the call site
export type RepackTargetPrefixError<K extends string> = {
  'Error: `targetPrefix` produces error kinds missing from the registry': K;
};

type RepackErrorResult<E extends NatError<NatErrorKind>, O extends string, T extends string> = [
  UnregisteredErrorKind<E['kind'], O, T>,
] extends [never]
  ? ResultErr<RepackedError<E, O, T>>
  : RepackTargetPrefixError<UnregisteredErrorKind<E['kind'], O, T>>;

/**
 * We use it when we want to change the error kind, and return a new error with
 * the same context; It helps us to:
 *  1. Keep implementation details hidden
 *  2. Keep a public error kind string size minimalist
 *
 * Example:
 *
 * `Client.Transport.SendRequest.PreferredRpc.NotFound` ->
 * `Client.GetAccountInfo.PreferredRpc.NotFound`
 *
 * Instead of
 * `Client.GetAccountInfo.Client.Transport.SendRequest.PreferredRpc.NotFound`
 */
export const repackError = <
  E extends NatError<NatErrorKind>,
  O extends ErrorKindPrefix<E['kind']>,
  T extends string,
>({
  error,
  originPrefix,
  targetPrefix,
}: {
  error: E;
  originPrefix: O;
  targetPrefix: T;
}) => {
  // The kind is built at runtime, so TS can't relate it to the registry entry -
  // this is the only place where we tell it which kinds we actually produce
  const kind = `${targetPrefix}.${error.kind.slice(originPrefix.length + 1)}` as NatErrorKind;

  return result.err(createNatError({ kind, context: error.context })) as RepackErrorResult<E, O, T>;
};
