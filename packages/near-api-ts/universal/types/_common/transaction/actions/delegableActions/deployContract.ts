import type { NatError } from '../../../../../src/_common/_common/_common/_common/natError';
import type { Base64String, Result } from '../../../common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../natError';

export interface CreateDeployContractActionPublicErrorRegistry {
  'CreateAction.DeployContract.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.DeployContract.Internal': InternalErrorContext;
}

type WasmU8 = { wasmU8: Uint8Array; wasmBase64?: never };
type WasmBase64 = { wasmU8?: never; wasmBase64: Base64String };

export type CreateDeployContractActionArgs = WasmU8 | WasmBase64;

export type DeployContractAction = {
  actionType: 'DeployContract';
  wasmU8: Uint8Array;
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

// ****** NEARCORE ********

export type NearcoreDeployContractAction = {
  deployContract: {
    code: Uint8Array;
  };
};
