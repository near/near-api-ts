import type { NatError } from '../../../../../src/_common/_common/_common/_common/natError';
import type { Base64String, Result } from '../../../common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../natError';

export interface CreateDeployLocalContractActionPublicErrorRegistry {
  'CreateAction.DeployLocalContract.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.DeployLocalContract.Internal': InternalErrorContext;
}

type WasmU8 = { wasmU8: Uint8Array; wasmBase64?: never };
type WasmBase64 = { wasmU8?: never; wasmBase64: Base64String };

export type CreateDeployLocalContractActionArgs = WasmU8 | WasmBase64;

export type DeployLocalContractAction = {
  actionType: 'DeployLocalContract';
  wasmU8: Uint8Array;
};

type CreateDeployLocalContractActionError =
  | NatError<'CreateAction.DeployLocalContract.Args.InvalidSchema'>
  | NatError<'CreateAction.DeployLocalContract.Internal'>;

export type SafeCreateDeployLocalContractAction = (
  args: CreateDeployLocalContractActionArgs,
) => Result<DeployLocalContractAction, CreateDeployLocalContractActionError>;

export type CreateDeployLocalContractAction = (
  args: CreateDeployLocalContractActionArgs,
) => DeployLocalContractAction;

// ****** NEARCORE ********

export type NearcoreDeployLocalContractAction = {
  deployContract: {
    code: Uint8Array;
  };
};
