import { convertTokensToUnits } from './tokenConverter/convertTokensToUnits';
import { convertUnitsToTokens } from './tokenConverter/convertUnitsToTokens';
import { NearDecimals } from '@common/configs/constants';
import { nodeInspectSymbol } from '@common/utils/common';
import type { InspectOptionsStylized } from 'node:util';
import type {
  CreateNearTokenFromNear,
  CreateNearTokenFromYoctoNear,
  Near,
  NearToken,
  NearTokenArgs,
  SafeCreateNearTokenFromNear,
  SafeCreateNearTokenFromYoctoNear,
  YoctoNear,
  SafeCreateNearToken,
  CreateNearToken,
  CreateNearTokenError,
} from 'nat-types/_common/nearToken';
import {
  NearTokenArgsSchema,
  NearInputSchema,
  YoctoNearInputSchema,
} from '@common/schemas/zod/common/nearToken';
import { result } from '@common/utils/result';
import { createNatError } from '@common/natError';
import { wrapInternalError } from '@common/utils/wrapInternalError';
import { asThrowable } from '@common/utils/asThrowable';
import type { Result } from 'nat-types/_common/common';

const NearTokenBrand = Symbol('NearToken');

const cache = {
  yoctoNear: new WeakMap<NearToken, YoctoNear>(),
  near: new WeakMap<NearToken, Near>(),
};

export const isNearToken = (value: unknown): value is NearToken =>
  typeof value === 'object' && value !== null && NearTokenBrand in value;

const toYoctoNear = (
  x: NearTokenArgs | NearToken,
): Result<YoctoNear, CreateNearTokenError> => {
  if (isNearToken(x)) return result.ok(x.yoctoNear);
  const nearToken = safeNearToken(x);
  return nearToken.ok ? result.ok(nearToken.value.yoctoNear) : nearToken;
};

/**
 * We use it as a prototype for all new NearToken instances. It allows us to reuse
 * these functions without creating a new fn instances every time we create a new NearToken
 */
const nearTokenProto: ThisType<NearToken> = {
  [NearTokenBrand]: true,
  // Lazy getter - calculate the 'near' value only after the first direct access;
  // save the result in the cache
  get near(): Near {
    const maybeValue = cache.near.get(this);
    if (maybeValue) return maybeValue;
    const value = convertUnitsToTokens(this.yoctoNear, NearDecimals);
    cache.near.set(this, value);

    return value;
  },

  get yoctoNear(): YoctoNear {
    const maybeValue = cache.yoctoNear.get(this);
    if (maybeValue) return maybeValue;

    const value = convertTokensToUnits(this.near, NearDecimals);
    cache.yoctoNear.set(this, value);

    return value;
  },

  // TODO Need to reuse method code and reduce boilerplate code, and reduce useless
  // transformations
  safeAdd(
    value: NearTokenArgs | NearToken,
  ): Result<NearToken, CreateNearTokenError> {
    return wrapInternalError('CreateNearToken.Internal', () => {
      const yoctoNear = toYoctoNear(value);
      return yoctoNear.ok
        ? safeNearToken({ yoctoNear: this.yoctoNear + yoctoNear.value })
        : yoctoNear;
    })();
  },

  add(value: NearTokenArgs | NearToken) {
    return asThrowable(this.safeAdd.bind(this))(value);
  },

  safeSub(
    value: NearTokenArgs | NearToken,
  ): Result<NearToken, CreateNearTokenError> {
    return wrapInternalError('CreateNearToken.Internal', () => {
      const yoctoNear = toYoctoNear(value);
      return yoctoNear.ok
        ? safeNearToken({ yoctoNear: this.yoctoNear - yoctoNear.value })
        : yoctoNear;
    })();
  },

  sub(value: NearTokenArgs | NearToken) {
    return asThrowable(this.safeSub.bind(this))(value);
  },

  safeGt(
    value: NearTokenArgs | NearToken,
  ): Result<boolean, CreateNearTokenError> {
    return wrapInternalError('CreateNearToken.Internal', () => {
      const yoctoNear = toYoctoNear(value);
      return yoctoNear.ok
        ? result.ok(this.yoctoNear > yoctoNear.value)
        : yoctoNear;
    })();
  },

  gt(value: NearTokenArgs | NearToken) {
    return asThrowable(this.safeGt.bind(this))(value);
  },

  safeLt(
    value: NearTokenArgs | NearToken,
  ): Result<boolean, CreateNearTokenError> {
    return wrapInternalError('CreateNearToken.Internal', () => {
      const yoctoNear = toYoctoNear(value);
      return yoctoNear.ok
        ? result.ok(this.yoctoNear < yoctoNear.value)
        : yoctoNear;
    })();
  },

  lt(value: NearTokenArgs | NearToken) {
    return asThrowable(this.safeLt.bind(this))(value);
  },

  toString() {
    return JSON.stringify({
      near: this.near,
      yoctoNear: this.yoctoNear.toString(),
    });
  },

  // In Node.js, this allows you to see the near/yoctoNear getter values,
  // which are not normally visible unless you access them directly.
  // This does not work in the browser — there you can only see a getter’s value
  // by explicitly expanding/clicking on it.
  ...(nodeInspectSymbol && {
    [nodeInspectSymbol as symbol](
      this: NearToken,
      _depth: number,
      _opts: InspectOptionsStylized,
    ) {
      return { near: this.near, yoctoNear: this.yoctoNear };
    },
  }),
} as const;

// FromYoctoNear

export const safeYoctoNear: SafeCreateNearTokenFromYoctoNear = wrapInternalError(
  'CreateNearTokenFromYoctoNear.Internal',
  (yoctoNear) => {
    const validYoctoNear = YoctoNearInputSchema.safeParse(yoctoNear);

    if (!validYoctoNear.success)
      return result.err(
        createNatError({
          kind: 'CreateNearTokenFromYoctoNear.Args.InvalidSchema',
          context: { zodError: validYoctoNear.error },
        }),
      );

    const nearToken = Object.create(nearTokenProto) as NearToken;

    Object.defineProperty(nearToken, 'yoctoNear', {
      value: validYoctoNear.data,
      enumerable: true,
    });

    return result.ok(Object.freeze(nearToken));
  },
);

export const throwableYoctoNear: CreateNearTokenFromYoctoNear =
  asThrowable(safeYoctoNear);

// FromNear

export const safeNear: SafeCreateNearTokenFromNear = wrapInternalError(
  'CreateNearTokenFromNear.Internal',
  (near) => {
    const validNear = NearInputSchema.safeParse(near);

    if (!validNear.success)
      return result.err(
        createNatError({
          kind: 'CreateNearTokenFromNear.Args.InvalidSchema',
          context: { zodError: validNear.error },
        }),
      );

    const nearToken = Object.create(nearTokenProto) as NearToken;

    Object.defineProperty(nearToken, 'near', {
      value: validNear.data,
      enumerable: true,
    });

    return result.ok(Object.freeze(nearToken));
  },
);

export const throwableNear: CreateNearTokenFromNear = asThrowable(safeNear);

// Near Token

export const safeNearToken: SafeCreateNearToken = wrapInternalError(
  'CreateNearToken.Internal',
  (args) => {
    const validArgs = NearTokenArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateNearToken.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    return 'yoctoNear' in args
      ? result.ok(throwableYoctoNear(args.yoctoNear))
      : result.ok(throwableNear(args.near));
  },
);

export const throwableNearToken: CreateNearToken = asThrowable(safeNearToken);
