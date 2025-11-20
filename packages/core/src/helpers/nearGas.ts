import type {
  Gas,
  GasInputAmount,
  NearGas,
  NearGasArgs,
  TeraGas,
  TeraGasInputAmount,
} from 'nat-types/nearGas';
import { nodeInspectSymbol } from '@common/utils/common';
import type { InspectOptionsStylized } from 'node:util';

const TeraCoefficient = 1_000_000_000_000n; // 10 ** 12
const NearGasBrand = Symbol('NearGas');

const cache = {
  gas: new WeakMap<NearGas, Gas>(),
  teraGas: new WeakMap<NearGas, TeraGas>(),
};

const toGas = (x: NearGasArgs | NearGas): Gas =>
  isNearGas(x) ? x.gas : nearGas(x).gas;

/**
 * We use it as a prototype for all new NearGas instances. It allows us to reuse
 * these functions without creating a new fn instances every time we create a new NearGas
 */
const nearGasProto: ThisType<NearGas> = {
  [NearGasBrand]: true,
  // Lazy getter - calculate the 'gas' value only after the first direct access;
  // save the result in the cache
  get gas(): Gas {
    const maybeValue = cache.gas.get(this);
    if (maybeValue) return maybeValue;

    const value = BigInt(this.teraGas) * TeraCoefficient;
    cache.gas.set(this, value);

    return value;
  },

  get teraGas(): TeraGas {
    const maybeValue = cache.teraGas.get(this);
    if (maybeValue) return maybeValue;

    const value = String(this.gas / TeraCoefficient); // We don't keep decimals
    cache.teraGas.set(this, value);

    return value;
  },

  add(x: NearGasArgs | NearGas): NearGas {
    return gas(this.gas + toGas(x));
  },

  sub(x: NearGasArgs | NearGas): NearGas {
    return gas(this.gas - toGas(x));
  },

  mul(x: NearGasArgs | NearGas): NearGas {
    return gas(this.gas * toGas(x));
  },

  gt(x: NearGasArgs | NearGas): boolean {
    return this.gas > toGas(x);
  },

  lt(x: NearGasArgs | NearGas): boolean {
    return this.gas < toGas(x);
  },

  toString() {
    return JSON.stringify({
      teraGas: this.teraGas,
      gas: this.gas.toString(),
    });
  },

  // In Node.js, this allows you to see the teraGas/gas getter values,
  // which are not normally visible unless you access them directly.
  // This does not work in the browser — there you can only see a getter’s value
  // by explicitly expanding/clicking on it.
  ...(nodeInspectSymbol && {
    [nodeInspectSymbol as symbol](
      this: NearGas,
      _depth: number,
      _opts: InspectOptionsStylized,
    ) {
      return { teraGas: this.teraGas, gas: this.gas };
    },
  }),
} as const;

export const gas = (gasInputAmount: GasInputAmount): NearGas => {
  const gasValue = BigInt(gasInputAmount); // TODO validate
  const nearGas = Object.create(nearGasProto) as NearGas;

  Object.defineProperty(nearGas, 'gas', {
    value: gasValue,
    enumerable: true,
  });

  return Object.freeze(nearGas);
};

export const teraGas = (teraGas: TeraGasInputAmount): NearGas => {
  const nearGas = Object.create(nearGasProto) as NearGas;

  Object.defineProperty(nearGas, 'teraGas', {
    value: teraGas, // TODO Validate
    enumerable: true,
  });

  return Object.freeze(nearGas);
};

export const nearGas = (args: NearGasArgs): NearGas => {
  if ('teraGas' in args) return teraGas(args.teraGas);
  if ('gas' in args) return gas(args.gas);
  throw new Error('Invalid gas option');
};

export const isNearGas = (value: unknown): value is NearGas =>
  typeof value === 'object' && value !== null && NearGasBrand in value;
