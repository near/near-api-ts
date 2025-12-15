import type { Base64String, Result } from 'nat-types/_common/common';
import type {
  InternalErrorContext,
  InvalidSchemaContext,
} from 'nat-types/natError';
import type { NatError } from '@common/natError';

export type CreateDeployContractActionErrorVariant =
  | {
      kind: 'CreateAction.DeployContract.Args.InvalidSchema';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'CreateAction.DeployContract.Internal';
      context: InternalErrorContext;
    };

export type CreateDeployContractActionInternalErrorKind =
  'CreateAction.DeployContract.Internal';

type WasmBase64 = { wasmBase64: Base64String; wasmBytes?: never };
type WasmBytes = { wasmBase64?: never; wasmBytes: Uint8Array };

export type CreateDeployContractActionArgs = WasmBase64 | WasmBytes;

export type DeployContractAction = {
  actionType: 'DeployContract';
  wasmBytes: Uint8Array;
};

type CreateDeployContractActionError =
  | NatError<'CreateAction.DeployContract.Args.InvalidSchema'>
  | NatError<'CreateAction.DeployContract.Internal'>;

export type SafeCreateDeployContractAction = (
  args: CreateDeployContractActionArgs,
) => Result<DeployContractAction, CreateDeployContractActionError>;

export type CreateDeployContractAction = (
  args: CreateDeployContractActionArgs,
) => DeployContractAction;

// ****** NATIVE ********

export type NativeDeployContractAction = {
  deployContract: {
    code: Uint8Array;
  };
};
