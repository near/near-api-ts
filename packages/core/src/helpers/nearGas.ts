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
} from 'nat-types/_common/nearGas';
import { nodeInspectSymbol } from '@common/utils/common';
import type { InspectOptionsStylized } from 'node:util';
import { wrapUnknownError } from '@common/utils/wrapUnknownError';
import { result } from '@common/utils/result';
import { createNatError } from '@common/natError';
import {
  GasInputSchema,
  NearGasArgsSchema,
  TeraGasInputSchema,
} from '@common/schemas/zod/common/nearGas';
import { asThrowable } from '@common/utils/asThrowable';
import { convertUnitsToTokens } from './tokens/tokenConverter/convertUnitsToTokens';
import { convertTokensToUnits } from './tokens/tokenConverter/convertTokensToUnits';
import type { Result } from 'nat-types/_common/common';

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
    //  12 - max digits after period for tera coefficient
    const value = convertUnitsToTokens(this.gas, 12);
    cache.teraGas.set(this, value);

    return value;
  },

  get gas(): Gas {
    const maybeValue = cache.gas.get(this);
    if (maybeValue) return maybeValue;
    // TODO maybe we can use a better name for this?
    const value = convertTokensToUnits(this.teraGas, 12);
    cache.gas.set(this, value);

    return value;
  },

  // TODO Need to reuse method code and reduce boilerplate code, and reduce useless
  // transformations
  safeAdd(value: NearGasMethodArgs): Result<NearGas, CreateNearGasError> {
    return wrapUnknownError('CreateNearGas.Unknown', () => {
      const gas = toGas(value);
      return gas.ok ? safeNearGas({ gas: this.gas + gas.value }) : gas;
    })();
  },

  add(value: NearGasMethodArgs) {
    return asThrowable(this.safeAdd.bind(this))(value);
  },

  safeSub(value: NearGasMethodArgs): Result<NearGas, CreateNearGasError> {
    return wrapUnknownError('CreateNearGas.Unknown', () => {
      const gas = toGas(value);
      return gas.ok ? safeNearGas({ gas: this.gas - gas.value }) : gas;
    })();
  },

  sub(value: NearGasMethodArgs) {
    return asThrowable(this.safeSub.bind(this))(value);
  },

  safeGt(value: NearGasMethodArgs): Result<boolean, CreateNearGasError> {
    return wrapUnknownError('CreateNearGas.Unknown', () => {
      const gas = toGas(value);
      return gas.ok ? result.ok(this.gas > gas.value) : gas;
    })();
  },

  gt(value: NearGasMethodArgs) {
    return asThrowable(this.safeGt.bind(this))(value);
  },

  safeLt(value: NearGasMethodArgs): Result<boolean, CreateNearGasError> {
    return wrapUnknownError('CreateNearGas.Unknown', () => {
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
    [nodeInspectSymbol as symbol](
      this: NearGas,
      _depth: number,
      _opts: InspectOptionsStylized,
    ) {
      return { teraGas: this.teraGas, gas: this.gas };
    },
  }),
} as const;

// FromGas

export const safeGas: SafeCreateNearGasFromGas = wrapUnknownError(
  'CreateNearGasFromGas.Unknown',
  (gas) => {
    const validGas = GasInputSchema.safeParse(gas);

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

export const throwableGas: CreateNearGasFromGas = asThrowable(safeGas);

// FromTeraGas

export const safeTeraGas: SafeCreateNearGasFromTeraGas = wrapUnknownError(
  'CreateNearGasFromTeraGas.Unknown',
  (teraGas) => {
    const validTeraGas = TeraGasInputSchema.safeParse(teraGas);

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

export const throwableTeraGas: CreateNearGasFromTeraGas =
  asThrowable(safeTeraGas);

// NearGas

export const safeNearGas: SafeCreateNearGas = wrapUnknownError(
  'CreateNearGas.Unknown',
  (args) => {
    const validArgs = NearGasArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateNearGas.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    return 'gas' in args
      ? result.ok(throwableGas(args.gas))
      : result.ok(throwableTeraGas(args.teraGas));
  },
);

export const throwableNearGas: CreateNearGas = asThrowable(safeNearGas);
