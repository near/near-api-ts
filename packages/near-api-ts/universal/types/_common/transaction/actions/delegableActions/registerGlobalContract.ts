import type { NatError } from '../../../../../src/_common/_common/_common/_common/natError';
import type { Base64String, Result } from '../../../common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../natError';

export interface CreateRegisterGlobalContractActionPublicErrorRegistry {
  'CreateAction.RegisterGlobalContract.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.RegisterGlobalContract.Internal': InternalErrorContext;
}

/**
 * How a registered global contract is addressed by the accounts that use it
 * (nearcore `GlobalContractDeployMode`):
 *
 * - `WasmHash` - the code is addressed by the hash of the wasm itself, which
 *   makes it immutable: registering new code produces a new hash and leaves
 *   every account already using the old one untouched.
 * - `OwnerAccountId` - the code is addressed by the account that registered it.
 *   That account can register new code under the same account id later, and
 *   every account using it picks the new code up.
 */
export type GlobalContractReference = 'WasmHash' | 'OwnerAccountId';

type WasmBase64 = { wasmBase64: Base64String; wasmBytes?: never }; // TODO rename to WasmU8
type WasmBytes = { wasmBase64?: never; wasmBytes: Uint8Array };

export type CreateRegisterGlobalContractActionArgs = {
  referenceBy: GlobalContractReference; // TODO maybe referenceTo ?
} & (WasmBase64 | WasmBytes);

/**
 * Publishes contract code to the chain without attaching it to the registrar's
 * own account, so that any account can adopt it with a `UseGlobalContract`
 * action. Nearcore calls it `DeployGlobalContract`.
 *
 * The registrar pays for the code storage once, up front, out of its balance -
 * accounts using the contract afterwards pay nothing for it.
 */
export type RegisterGlobalContractAction = {
  actionType: 'RegisterGlobalContract';
  wasmBytes: Uint8Array;
  referenceBy: GlobalContractReference;
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
