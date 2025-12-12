import type { Result, Tokens, Units } from 'nat-types/_common/common';
import type {
  InvalidSchemaContext,
  UnknownErrorContext,
} from 'nat-types/natError';
import type { NatError } from '@common/natError';

export type NearTokenErrorVariant =
  | {
      kind: 'CreateNearToken.Args.InvalidSchema';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'CreateNearToken.Unknown';
      context: UnknownErrorContext;
    }
  | {
      kind: 'CreateNearTokenFromYoctoNear.Args.InvalidSchema';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'CreateNearTokenFromYoctoNear.Unknown';
      context: UnknownErrorContext;
    }
  | {
      kind: 'CreateNearTokenFromNear.Args.InvalidSchema';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'CreateNearTokenFromNear.Unknown';
      context: UnknownErrorContext;
    };

export type YoctoNearInput = Units;
export type NearInput = Tokens;

// CreateNearToken --------------------------------------------------------

export type NearTokenArgs = { near: NearInput } | { yoctoNear: YoctoNearInput };

export type YoctoNear = bigint;
export type Near = string;

export type CreateNearTokenError =
  | NatError<'CreateNearToken.Args.InvalidSchema'>
  | NatError<'CreateNearToken.Unknown'>;

export type NearToken = Readonly<{
  yoctoNear: YoctoNear;
  near: Near;

  safeAdd: (
    value: NearTokenArgs | NearToken,
  ) => Result<NearToken, CreateNearTokenError>;
  add: (value: NearTokenArgs | NearToken) => NearToken;

  safeSub: (
    value: NearTokenArgs | NearToken,
  ) => Result<NearToken, CreateNearTokenError>;
  sub: (value: NearTokenArgs | NearToken) => NearToken;

  safeGt: (
    value: NearTokenArgs | NearToken,
  ) => Result<boolean, CreateNearTokenError>;
  gt: (value: NearTokenArgs | NearToken) => boolean;

  safeLt: (
    value: NearTokenArgs | NearToken,
  ) => Result<boolean, CreateNearTokenError>;
  lt: (value: NearTokenArgs | NearToken) => boolean;
}>;

export type SafeCreateNearToken = (
  args: NearTokenArgs,
) => Result<NearToken, CreateNearTokenError>;

export type CreateNearToken = (args: NearTokenArgs) => NearToken;

// FromYoctoNear --------------------------------------------------------

type CreateNearTokenFromYoctoNearError =
  | NatError<'CreateNearTokenFromYoctoNear.Args.InvalidSchema'>
  | NatError<'CreateNearTokenFromYoctoNear.Unknown'>;

export type SafeCreateNearTokenFromYoctoNear = (
  yoctoNear: YoctoNearInput,
) => Result<NearToken, CreateNearTokenFromYoctoNearError>;

export type CreateNearTokenFromYoctoNear = (
  yoctoNear: YoctoNearInput,
) => NearToken;

// FromNear --------------------------------------------------------

type CreateNearTokenFromNearError =
  | NatError<'CreateNearTokenFromNear.Args.InvalidSchema'>
  | NatError<'CreateNearTokenFromNear.Unknown'>;

export type SafeCreateNearTokenFromNear = (
  near: NearInput,
) => Result<NearToken, CreateNearTokenFromNearError>;

export type CreateNearTokenFromNear = (near: NearInput) => NearToken;
