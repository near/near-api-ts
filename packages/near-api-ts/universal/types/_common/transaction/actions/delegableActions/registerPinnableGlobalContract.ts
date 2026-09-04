import type { NatError } from '../../../../../src/_common/_common/_common/_common/natError';
import type { Base64String, Result } from '../../../common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../natError';

export interface CreateRegisterPinnableGlobalContractActionPublicErrorRegistry {
  'CreateAction.RegisterPinnableGlobalContract.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.RegisterPinnableGlobalContract.Internal': InternalErrorContext;
}

type WasmU8 = { wasmU8: Uint8Array; wasmBase64?: never };
type WasmBase64 = { wasmU8?: never; wasmBase64: Base64String };

export type CreateRegisterPinnableGlobalContractActionArgs = WasmU8 | WasmBase64;

/**
 * Publishes immutable contract code to the chain without attaching it to the
 * registrar's own account. The code is addressed by its wasm hash and can be
 * adopted by any account with a `PinGlobalContract` action.
 *
 * The registrar pays for the code storage once, up front, out of its balance;
 * accounts using the contract afterwards pay nothing for it.
 */
export type RegisterPinnableGlobalContractAction = {
  actionType: 'RegisterPinnableGlobalContract';
  wasmU8: Uint8Array;
};

type CreateRegisterPinnableGlobalContractActionError =
  | NatError<'CreateAction.RegisterPinnableGlobalContract.Args.InvalidSchema'>
  | NatError<'CreateAction.RegisterPinnableGlobalContract.Internal'>;

export type SafeCreateRegisterPinnableGlobalContractAction = (
  args: CreateRegisterPinnableGlobalContractActionArgs,
) => Result<RegisterPinnableGlobalContractAction, CreateRegisterPinnableGlobalContractActionError>;

export type CreateRegisterPinnableGlobalContractAction = (
  args: CreateRegisterPinnableGlobalContractActionArgs,
) => RegisterPinnableGlobalContractAction;

// ****** NEARCORE ********

export type NearcoreRegisterPinnableGlobalContractAction = {
  deployGlobalContract: {
    code: Uint8Array;
    deployMode: { codeHash: {} };
  };
};
