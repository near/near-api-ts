import { convertTokensToUnits } from '@common/utils/tokenConverter/convertTokensToUnits';
import { convertUnitsToTokens } from '@common/utils/tokenConverter/convertUnitsToTokens';
import { NearDecimals } from '@common/configs/constants';
import { nodeInspectSymbol } from '@common/utils/common';
import type {
  NearTokenArgs,
  NearToken,
  Near,
  YoctoNear,
  NearInputAmount,
  YoctoNearInputAmount,
} from 'nat-types/common';
import type { InspectOptionsStylized } from 'node:util';

const NearTokenBrand = Symbol('NearTokenBrand');

const cache = {
  near: new WeakMap<NearToken, string>(),
  yoctoNear: new WeakMap<NearToken, bigint>(),
};

const toYoctoNear = (x: NearTokenArgs | NearToken): YoctoNear =>
  isNearToken(x) ? x.yoctoNear : nearToken(x).yoctoNear;

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

  add(x: NearTokenArgs | NearToken): NearToken {
    return yoctoNear(this.yoctoNear + toYoctoNear(x));
  },

  sub(x: NearTokenArgs | NearToken): NearToken {
    return yoctoNear(this.yoctoNear - toYoctoNear(x));
  },

  mul(x: NearTokenArgs | NearToken): NearToken {
    return yoctoNear(this.yoctoNear * toYoctoNear(x));
  },

  gt(x: NearTokenArgs | NearToken): boolean {
    return this.yoctoNear > toYoctoNear(x);
  },

  lt(x: NearTokenArgs | NearToken): boolean {
    return this.yoctoNear < toYoctoNear(x);
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

export const yoctoNear = (units: YoctoNearInputAmount): NearToken => {
  const yoctoNear = BigInt(units); // TODO validate units
  const obj = Object.create(nearTokenProto) as NearToken;

  Object.defineProperty(obj, 'yoctoNear', {
    value: yoctoNear,
    enumerable: true,
  });

  return Object.freeze(obj);
};

export const near = (tokens: NearInputAmount): NearToken => {
  const obj = Object.create(nearTokenProto) as NearToken;

  Object.defineProperty(obj, 'near', {
    value: tokens, // TODO validate tokens
    enumerable: true,
  });

  return Object.freeze(obj);
};

export const nearToken = (args: NearTokenArgs): NearToken => {
  if ('yoctoNear' in args) return yoctoNear(args.yoctoNear);
  if ('near' in args) return near(args.near);
  throw new Error('Invalid args format');
};

export const isNearToken = (value: unknown): value is NearToken =>
  typeof value === 'object' && value !== null && NearTokenBrand in value;
