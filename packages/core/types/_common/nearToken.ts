import type { Result, Tokens, Units } from 'nat-types/_common/common';
import type {
  InvalidSchemaContext,
  InternalErrorContext,
} from 'nat-types/natError';
import type { NatError } from '@common/natError';

export type NearTokenErrorVariant =
  | {
      kind: 'CreateNearToken.Args.InvalidSchema';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'CreateNearToken.Internal';
      context: InternalErrorContext;
    }
  | {
      kind: 'CreateNearTokenFromYoctoNear.Args.InvalidSchema';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'CreateNearTokenFromYoctoNear.Internal';
      context: InternalErrorContext;
    }
  | {
      kind: 'CreateNearTokenFromNear.Args.InvalidSchema';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'CreateNearTokenFromNear.Internal';
      context: InternalErrorContext;
    };

export type YoctoNearInput = Units;
export type NearInput = Tokens;

// CreateNearToken --------------------------------------------------------

export type NearTokenArgs = { near: NearInput } | { yoctoNear: YoctoNearInput };

export type YoctoNear = bigint;
export type Near = string;

export type CreateNearTokenError =
  | NatError<'CreateNearToken.Args.InvalidSchema'>
  | NatError<'CreateNearToken.Internal'>;

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
  | NatError<'CreateNearTokenFromYoctoNear.Internal'>;

export type SafeCreateNearTokenFromYoctoNear = (
  yoctoNear: YoctoNearInput,
) => Result<NearToken, CreateNearTokenFromYoctoNearError>;

export type CreateNearTokenFromYoctoNear = (
  yoctoNear: YoctoNearInput,
) => NearToken;

// FromNear --------------------------------------------------------

type CreateNearTokenFromNearError =
  | NatError<'CreateNearTokenFromNear.Args.InvalidSchema'>
  | NatError<'CreateNearTokenFromNear.Internal'>;

export type SafeCreateNearTokenFromNear = (
  near: NearInput,
) => Result<NearToken, CreateNearTokenFromNearError>;

export type CreateNearTokenFromNear = (near: NearInput) => NearToken;
