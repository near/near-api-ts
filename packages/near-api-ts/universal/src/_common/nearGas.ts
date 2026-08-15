import type { InspectOptionsStylized } from 'node:util';
import type { Result } from '../../types/_common/common';
import type {
  CreateNearGas,
  CreateNearGasError,
  CreateNearGasFromGas,
  CreateNearGasFromTeraGas,
  Gas,
  NearGas,
  NearGasMethodArgs,
  SafeCreateNearGas,
  SafeCreateNearGasFromGas,
  SafeCreateNearGasFromTeraGas,
  TeraGas,
} from '../../types/_common/nearGas';
import { createNatError } from './_common/_common/_common/natError';
import { TeraGasDecimals } from './_common/_common/constants';
import { result } from './_common/_common/result';
import { asThrowable } from './_common/asThrowable';
import { convertDecimalToUnits } from './_common/unitConverter/convertDecimalToUnits';
import { convertUnitsToDecimal } from './_common/unitConverter/convertUnitsToDecimal';
import { wrapInternalError } from './_common/wrapInternalError';
import {
  GasInputZodSchema,
  NearGasArgsZodSchema,
  TeraGasInputZodSchema,
} from './_common/zodSchemas/nearGas';

const isNodeJs =
  typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

// TODO consider removing it and make it node-package specific - no need this code for browser/universal
const nodeInspectSymbol = isNodeJs ? Symbol.for('nodejs.util.inspect.custom') : undefined;

const NearGasBrand = Symbol('NearGas');

const cache = {
  gas: new WeakMap<NearGas, Gas>(),
  teraGas: new WeakMap<NearGas, TeraGas>(),
};

export const isNearGas = (value: unknown): value is NearGas =>
  typeof value === 'object' && value !== null && NearGasBrand in value;

const toGas = (x: NearGasMethodArgs): Result<Gas, CreateNearGasError> => {
  if (isNearGas(x)) return result.ok(x.gas);
  const nearGas = safeNearGas(x);
  return nearGas.ok ? result.ok(nearGas.value.gas) : nearGas;
};

/**
 * We use it as a prototype for all new NearGas instances. It allows us to reuse
 * these functions without creating a new fn instances every time we create a new NearGas
 */
const nearGasProto: ThisType<NearGas> = {
  [NearGasBrand]: true,
  get teraGas(): TeraGas {
    // Lazy getter - calculate the 'teraGas' value only after the first direct access;
    // save the result in the cache
    const maybeValue = cache.teraGas.get(this);
    if (maybeValue) return maybeValue;
    const value = convertUnitsToDecimal(this.gas, TeraGasDecimals);
    cache.teraGas.set(this, value);

    return value;
  },

  get gas(): Gas {
    const maybeValue = cache.gas.get(this);
    if (maybeValue) return maybeValue;
    const value = convertDecimalToUnits(this.teraGas, TeraGasDecimals);
    cache.gas.set(this, value);

    return value;
  },

  // TODO Need to reuse method code and reduce boilerplate code, and reduce useless
  // transformations
  safeAdd(value: NearGasMethodArgs): Result<NearGas, CreateNearGasError> {
    return wrapInternalError('CreateNearGas.Internal', () => {
      const gas = toGas(value);
      return gas.ok ? safeNearGas({ gas: this.gas + gas.value }) : gas;
    })();
  },

  add(value: NearGasMethodArgs) {
    return asThrowable(this.safeAdd.bind(this))(value);
  },

  safeSub(value: NearGasMethodArgs): Result<NearGas, CreateNearGasError> {
    return wrapInternalError('CreateNearGas.Internal', () => {
      const gas = toGas(value);
      return gas.ok ? safeNearGas({ gas: this.gas - gas.value }) : gas;
    })();
  },

  sub(value: NearGasMethodArgs) {
    return asThrowable(this.safeSub.bind(this))(value);
  },

  safeGt(value: NearGasMethodArgs): Result<boolean, CreateNearGasError> {
    return wrapInternalError('CreateNearGas.Internal', () => {
      const gas = toGas(value);
      return gas.ok ? result.ok(this.gas > gas.value) : gas;
    })();
  },

  gt(value: NearGasMethodArgs) {
    return asThrowable(this.safeGt.bind(this))(value);
  },

  safeLt(value: NearGasMethodArgs): Result<boolean, CreateNearGasError> {
    return wrapInternalError('CreateNearGas.Internal', () => {
      const gas = toGas(value);
      return gas.ok ? result.ok(this.gas < gas.value) : gas;
    })();
  },

  lt(value: NearGasMethodArgs) {
    return asThrowable(this.safeLt.bind(this))(value);
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
    [nodeInspectSymbol as symbol](this: NearGas, _depth: number, _opts: InspectOptionsStylized) {
      return { teraGas: this.teraGas, gas: this.gas };
    },
  }),
} as const;

// FromGas

export const safeGas: SafeCreateNearGasFromGas = wrapInternalError(
  'CreateNearGasFromGas.Internal',
  (gas) => {
    const validGas = GasInputZodSchema.safeParse(gas);

    if (!validGas.success)
      return result.err(
        createNatError({
          kind: 'CreateNearGasFromGas.Args.InvalidSchema',
          context: { zodError: validGas.error },
        }),
      );

    const nearGas = Object.create(nearGasProto) as NearGas;

    Object.defineProperty(nearGas, 'gas', {
      value: validGas.data,
      enumerable: true,
    });

    return result.ok(Object.freeze(nearGas));
  },
);

export const gas: CreateNearGasFromGas = asThrowable(safeGas);

// FromTeraGas

export const safeTeraGas: SafeCreateNearGasFromTeraGas = wrapInternalError(
  'CreateNearGasFromTeraGas.Internal',
  (teraGas) => {
    const validTeraGas = TeraGasInputZodSchema.safeParse(teraGas);

    if (!validTeraGas.success)
      return result.err(
        createNatError({
          kind: 'CreateNearGasFromTeraGas.Args.InvalidSchema',
          context: { zodError: validTeraGas.error },
        }),
      );

    const nearGas = Object.create(nearGasProto) as NearGas;

    Object.defineProperty(nearGas, 'teraGas', {
      value: validTeraGas.data,
      enumerable: true,
    });

    return result.ok(Object.freeze(nearGas));
  },
);

export const teraGas: CreateNearGasFromTeraGas = asThrowable(safeTeraGas);

// NearGas

export const safeNearGas: SafeCreateNearGas = wrapInternalError(
  'CreateNearGas.Internal',
  (args) => {
    const validArgs = NearGasArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateNearGas.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    return 'gas' in args ? result.ok(gas(args.gas)) : result.ok(teraGas(args.teraGas));
  },
);

export const nearGas: CreateNearGas = asThrowable(safeNearGas);
