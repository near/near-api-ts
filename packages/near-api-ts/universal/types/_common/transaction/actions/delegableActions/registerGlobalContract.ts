import type { NatError } from '../../../../../src/_common/_common/_common/_common/natError';
import type { Base64String, Result } from '../../../common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../natError';

export interface CreateRegisterGlobalContractActionPublicErrorRegistry {
  'CreateAction.RegisterGlobalContract.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.RegisterGlobalContract.Internal': InternalErrorContext;
}

/**
 * Whether the registered code can be replaced later (nearcore
 * `GlobalContractDeployMode`):
 *
 * - `Mutable` - the code is addressed by the account that registered it. That
 *   account can register new code under the same account id later, and every
 *   account that linked to it (`LinkGlobalContractAction`) picks the new code up.
 * - `Immutable` - the code is addressed by the hash of the wasm itself, so it
 *   can never change: registering new code produces a new hash and leaves every
 *   account already pinned to the old one (`PinGlobalContractAction`) untouched.
 */
export type GlobalContractWasmMutability = 'Mutable' | 'Immutable';

type WasmU8 = { wasmU8: Uint8Array; wasmBase64?: never };
type WasmBase64 = { wasmU8?: never; wasmBase64: Base64String };

export type CreateRegisterGlobalContractActionArgs = {
  wasmMutability: GlobalContractWasmMutability;
} & (WasmU8 | WasmBase64);

/**
 * Publishes contract code to the chain without attaching it to the registrar's
 * own account, so that any account can adopt it with a `LinkGlobalContract` or
 * a `PinGlobalContract` action. Nearcore calls it `DeployGlobalContract`.
 *
 * The registrar pays for the code storage once, up front, out of its balance -
 * accounts using the contract afterwards pay nothing for it.
 */
export type RegisterGlobalContractAction = {
  actionType: 'RegisterGlobalContract';
  wasmU8: Uint8Array;
  wasmMutability: GlobalContractWasmMutability;
};

type CreateRegisterGlobalContractActionError =
  | NatError<'CreateAction.RegisterGlobalContract.Args.InvalidSchema'>
  | NatError<'CreateAction.RegisterGlobalContract.Internal'>;

export type SafeCreateRegisterGlobalContractAction = (
  args: CreateRegisterGlobalContractActionArgs,
) => Result<RegisterGlobalContractAction, CreateRegisterGlobalContractActionError>;

export type CreateRegisterGlobalContractAction = (
  args: CreateRegisterGlobalContractActionArgs,
) => RegisterGlobalContractAction;

// ****** NEARCORE ********

type NearcoreCodeHashDeployMode = { codeHash: {} };
type NearcoreAccountIdDeployMode = { accountId: {} };

export type NearcoreRegisterGlobalContractAction = {
  deployGlobalContract: {
    code: Uint8Array;
    deployMode: NearcoreCodeHashDeployMode | NearcoreAccountIdDeployMode;
  };
};
