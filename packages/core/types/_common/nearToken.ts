import type { Result, Tokens, Units } from 'nat-types/_common/common';
import type {
  InvalidSchemaContext,
  UnknownErrorContext,
} from 'nat-types/natError';
import type { NatError } from '@common/natError';

export type NearTokenErrorVariant =
  | {
      kind: 'CreateNearToken.InvalidArgs';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'CreateNearToken.Unknown';
      context: UnknownErrorContext;
    }
  | {
      kind: 'CreateNearTokenFromYoctoNear.InvalidArgs';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'CreateNearTokenFromYoctoNear.Unknown';
      context: UnknownErrorContext;
    }
  | {
      kind: 'CreateNearTokenFromNear.InvalidArgs';
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
  | NatError<'CreateNearToken.InvalidArgs'>
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
  | NatError<'CreateNearTokenFromYoctoNear.InvalidArgs'>
  | NatError<'CreateNearTokenFromYoctoNear.Unknown'>;

export type SafeCreateNearTokenFromYoctoNear = (
  yoctoNear: YoctoNearInput,
) => Result<NearToken, CreateNearTokenFromYoctoNearError>;

export type CreateNearTokenFromYoctoNear = (
  yoctoNear: YoctoNearInput,
) => NearToken;

// FromNear --------------------------------------------------------

type CreateNearTokenFromNearError =
  | NatError<'CreateNearTokenFromNear.InvalidArgs'>
  | NatError<'CreateNearTokenFromNear.Unknown'>;

export type SafeCreateNearTokenFromNear = (
  near: NearInput,
) => Result<NearToken, CreateNearTokenFromNearError>;

export type CreateNearTokenFromNear = (near: NearInput) => NearToken;
