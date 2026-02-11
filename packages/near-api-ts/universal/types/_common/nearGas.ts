import type {
  InvalidSchemaContext,
  InternalErrorContext,
} from '../natError';
import type { NatError } from '../../src/_common/natError';
import type { Result } from './common';

export type NearGasErrorVariant =
  | {
      kind: 'CreateNearGas.Args.InvalidSchema';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'CreateNearGas.Internal';
      context: InternalErrorContext;
    }
  | {
      kind: 'CreateNearGasFromGas.Args.InvalidSchema';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'CreateNearGasFromGas.Internal';
      context: InternalErrorContext;
    }
  | {
      kind: 'CreateNearGasFromTeraGas.Args.InvalidSchema';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'CreateNearGasFromTeraGas.Internal';
      context: InternalErrorContext;
    };

export type GasInput = bigint | number;
export type TeraGasInput = string;

export type NearGasArgs = { gas: GasInput } | { teraGas: TeraGasInput };

export type Gas = bigint;
export type TeraGas = string;

export type NearGasMethodArgs = NearGasArgs | NearGas;

export type CreateNearGasError =
  | NatError<'CreateNearGas.Args.InvalidSchema'>
  | NatError<'CreateNearGas.Internal'>;

export type NearGas = Readonly<{
  gas: Gas;
  teraGas: TeraGas;

  safeAdd: (value: NearGasMethodArgs) => Result<NearGas, CreateNearGasError>;
  add: (value: NearGasMethodArgs) => NearGas;

  safeSub: (value: NearGasMethodArgs) => Result<NearGas, CreateNearGasError>;
  sub: (value: NearGasMethodArgs) => NearGas;

  safeGt: (value: NearGasMethodArgs) => Result<boolean, CreateNearGasError>;
  gt: (value: NearGasMethodArgs) => boolean;

  safeLt: (value: NearGasMethodArgs) => Result<boolean, CreateNearGasError>;
  lt: (value: NearGasMethodArgs) => boolean;
}>;

export type SafeCreateNearGas = (
  args: NearGasArgs,
) => Result<NearGas, CreateNearGasError>;

export type CreateNearGas = (args: NearGasArgs) => NearGas;

// FromGas --------------------------------------------------------

type CreateNearGasFromGasError =
  | NatError<'CreateNearGasFromGas.Args.InvalidSchema'>
  | NatError<'CreateNearGasFromGas.Internal'>;

export type SafeCreateNearGasFromGas = (
  gas: GasInput,
) => Result<NearGas, CreateNearGasFromGasError>;

export type CreateNearGasFromGas = (gas: GasInput) => NearGas;

// FromTeraGas --------------------------------------------------------

type CreateNearGasFromTeraGasError =
  | NatError<'CreateNearGasFromTeraGas.Args.InvalidSchema'>
  | NatError<'CreateNearGasFromTeraGas.Internal'>;

export type SafeCreateNearGasFromTeraGas = (
  teraGas: TeraGasInput,
) => Result<NearGas, CreateNearGasFromTeraGasError>;

export type CreateNearGasFromTeraGas = (teraGas: TeraGasInput) => NearGas;
