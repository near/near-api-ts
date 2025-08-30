import { convertTokensToUnits } from '@common/utils/tokenConverter/convertTokensToUnits';
import { convertUnitsToTokens } from '@common/utils/tokenConverter/convertUnitsToTokens';
import { NearDecimals } from '@common/configs/constants';
import { nodeInspectSymbol } from '@common/utils/common';
import type {
  Units,
  Tokens,
  NearOption,
  NearToken,
  Near,
  YoctoNear,
} from 'nat-types/common';
import type { InspectOptionsStylized } from 'node:util';

const cache = {
  near: new WeakMap<NearToken, string>(),
  yoctoNear: new WeakMap<NearToken, bigint>(),
};

const getYocto = (x: NearToken | YoctoNear) =>
  typeof x === 'bigint' ? x : x.yoctoNear;

/**
 * We use it as a prototype for all new NearToken instances. It allows us to reuse
 * these functions without creating a new fn instances every time we create a new NearToken
 */
const nearTokenProto: ThisType<NearToken> = {
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

  add(x: NearToken | YoctoNear): NearToken {
    return yoctoNear(this.yoctoNear + getYocto(x));
  },

  sub(x: NearToken | YoctoNear): NearToken {
    return yoctoNear(this.yoctoNear - getYocto(x));
  },

  mul(x: NearToken | YoctoNear): NearToken {
    return yoctoNear(this.yoctoNear * getYocto(x));
  },

  gt(x: NearToken | YoctoNear): boolean {
    return this.yoctoNear > getYocto(x);
  },

  lt(x: NearToken | YoctoNear): boolean {
    return this.yoctoNear < getYocto(x);
  },

  toString() {
    return JSON.stringify({
      near: this.near,
      yoctoNear: this.yoctoNear.toString(),
    });
  },

  // In Node.js, this allows you to see the near/yoctoNear getter values,
  // which are not normally visible unless you access them directly.
  // You can view them with console.dir(value, { customInspect: true }).
  //
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

export const yoctoNear = (units: Units): NearToken => {
  // TODO validate units
  const yoctoNear = BigInt(units);
  const obj = Object.create(nearTokenProto) as NearToken;

  Object.defineProperty(obj, 'yoctoNear', {
    value: yoctoNear,
    enumerable: true,
  });

  return Object.freeze(obj);
};

export const near = (tokens: Tokens): NearToken => {
  // TODO validate tokens
  const obj = Object.create(nearTokenProto) as NearToken;

  Object.defineProperty(obj, 'near', {
    value: tokens,
    enumerable: true,
  });

  return Object.freeze(obj);
};

export const fromNearOption = (nearOption: NearOption): NearToken => {
  if ('yoctoNear' in nearOption) return yoctoNear(nearOption.yoctoNear);
  if ('near' in nearOption) return near(nearOption.near);
  throw new Error('Invalid nearOption format');
};
