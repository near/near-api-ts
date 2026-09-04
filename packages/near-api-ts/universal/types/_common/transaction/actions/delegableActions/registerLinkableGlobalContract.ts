import type { NatError } from '../../../../../src/_common/_common/_common/_common/natError';
import type { Base64String, Result } from '../../../common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../natError';

export interface CreateRegisterLinkableGlobalContractActionPublicErrorRegistry {
  'CreateAction.RegisterLinkableGlobalContract.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.RegisterLinkableGlobalContract.Internal': InternalErrorContext;
}

type WasmU8 = { wasmU8: Uint8Array; wasmBase64?: never };
type WasmBase64 = { wasmU8?: never; wasmBase64: Base64String };

export type CreateRegisterLinkableGlobalContractActionArgs = WasmU8 | WasmBase64;

/**
 * Publishes replaceable contract code to the chain without attaching it to the
 * registrar's own account. The code is addressed by the registrar's account id
 * and can be adopted by any account with a `LinkGlobalContract` action.
 *
 * Registering new linkable code from the same account updates every account
 * linked to it. The registrar pays for the code storage once, up front.
 */
export type RegisterLinkableGlobalContractAction = {
  actionType: 'RegisterLinkableGlobalContract';
  wasmU8: Uint8Array;
};

type CreateRegisterLinkableGlobalContractActionError =
  | NatError<'CreateAction.RegisterLinkableGlobalContract.Args.InvalidSchema'>
  | NatError<'CreateAction.RegisterLinkableGlobalContract.Internal'>;

export type SafeCreateRegisterLinkableGlobalContractAction = (
  args: CreateRegisterLinkableGlobalContractActionArgs,
) => Result<RegisterLinkableGlobalContractAction, CreateRegisterLinkableGlobalContractActionError>;

export type CreateRegisterLinkableGlobalContractAction = (
  args: CreateRegisterLinkableGlobalContractActionArgs,
) => RegisterLinkableGlobalContractAction;

// ****** NEARCORE ********

export type NearcoreRegisterLinkableGlobalContractAction = {
  deployGlobalContract: {
    code: Uint8Array;
    deployMode: { accountId: {} };
  };
};
