import type { NatError } from '../../../../../src/_common/_common/_common/_common/natError';
import type { ContractWasmHash, Result } from '../../../common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../natError';

export interface CreatePinGlobalContractActionPublicErrorRegistry {
  'CreateAction.PinGlobalContract.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.PinGlobalContract.Internal': InternalErrorContext;
}

export type CreatePinGlobalContractActionArgs = {
  globalContractWasmHash: ContractWasmHash;
};

/**
 * Points the receiver account at a global contract registered with
 * `wasmMutability: 'Immutable'`, the way `DeployContract` attaches a wasm blob
 * the transaction carries itself. Nearcore calls it `UseGlobalContract`.
 *
 * The account is pinned to that exact wasm - nobody can swap the code under it,
 * because a different wasm has a different hash. Use `LinkGlobalContractAction`
 * to follow a registrar account's code instead.
 */
export type PinGlobalContractAction = {
  actionType: 'PinGlobalContract';
  globalContractWasmHash: ContractWasmHash;
};

type CreatePinGlobalContractActionError =
  | NatError<'CreateAction.PinGlobalContract.Args.InvalidSchema'>
  | NatError<'CreateAction.PinGlobalContract.Internal'>;

export type SafeCreatePinGlobalContractAction = (
  args: CreatePinGlobalContractActionArgs,
) => Result<PinGlobalContractAction, CreatePinGlobalContractActionError>;

export type CreatePinGlobalContractAction = (
  args: CreatePinGlobalContractActionArgs,
) => PinGlobalContractAction;

// ****** NEARCORE ********

export type NearcorePinGlobalContractAction = {
  useGlobalContract: {
    contractIdentifier: { codeHash: Uint8Array };
  };
};
