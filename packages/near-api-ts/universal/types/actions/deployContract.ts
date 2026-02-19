import type { NatError } from '../../src/_common/natError';
import type { Base64String, Result } from '../_common/common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../natError';

export interface CreateDeployContractActionPublicErrorRegistry {
  'CreateAction.DeployContract.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.DeployContract.Internal': InternalErrorContext;
}

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
