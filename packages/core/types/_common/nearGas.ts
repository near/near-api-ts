import type {
  InvalidSchemaContext,
  UnknownErrorContext,
} from 'nat-types/natError';
import type { NatError } from '@common/natError';
import type { Result } from 'nat-types/_common/common';

export type NearGasErrorVariant =
  | {
      kind: 'CreateNearGas.InvalidArgs';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'CreateNearGas.Unknown';
      context: UnknownErrorContext;
    }
  | {
      kind: 'CreateNearGasFromGas.InvalidArgs';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'CreateNearGasFromGas.Unknown';
      context: UnknownErrorContext;
    }
  | {
      kind: 'CreateNearGasFromTeraGas.InvalidArgs';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'CreateNearGasFromTeraGas.Unknown';
      context: UnknownErrorContext;
    };

export type GasInput = bigint | number;
export type TeraGasInput = string;

export type NearGasArgs = { gas: GasInput } | { teraGas: TeraGasInput };

export type Gas = bigint;
export type TeraGas = string;

export type NearGasMethodArgs = NearGasArgs | NearGas;

export type CreateNearGasError =
  | NatError<'CreateNearGas.InvalidArgs'>
  | NatError<'CreateNearGas.Unknown'>;

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
  | NatError<'CreateNearGasFromGas.InvalidArgs'>
  | NatError<'CreateNearGasFromGas.Unknown'>;

export type SafeCreateNearGasFromGas = (
  gas: GasInput,
) => Result<NearGas, CreateNearGasFromGasError>;

export type CreateNearGasFromGas = (gas: GasInput) => NearGas;

// FromTeraGas --------------------------------------------------------

type CreateNearGasFromTeraGasError =
  | NatError<'CreateNearGasFromTeraGas.InvalidArgs'>
  | NatError<'CreateNearGasFromTeraGas.Unknown'>;

export type SafeCreateNearGasFromTeraGas = (
  teraGas: TeraGasInput,
) => Result<NearGas, CreateNearGasFromTeraGasError>;

export type CreateNearGasFromTeraGas = (teraGas: TeraGasInput) => NearGas;
