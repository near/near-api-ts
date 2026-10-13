import type { NatError } from '../../../../../src/_common/_common/_common/_common/natError';
import type { Base64String, Result } from '../../../common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../natError';

export interface CreatePublishPinnableGlobalContractActionPublicErrorRegistry {
  'CreateAction.PublishPinnableGlobalContract.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.PublishPinnableGlobalContract.Internal': InternalErrorContext;
}

type WasmU8 = { wasmU8: Uint8Array; wasmBase64?: never };
type WasmBase64 = { wasmU8?: never; wasmBase64: Base64String };

export type CreatePublishPinnableGlobalContractActionArgs = WasmU8 | WasmBase64;

/**
 * Publishes immutable contract code to the chain without attaching it to the
 * publisher's own account. The code is addressed by its wasm hash and can be
 * adopted by any account with a `PinGlobalContract` action.
 *
 * The publisher pays for the code storage once, up front, out of its balance;
 * accounts using the contract afterwards pay nothing for it.
 */
export type PublishPinnableGlobalContractAction = {
  actionType: 'PublishPinnableGlobalContract';
  wasmU8: Uint8Array;
};

type CreatePublishPinnableGlobalContractActionError =
  | NatError<'CreateAction.PublishPinnableGlobalContract.Args.InvalidSchema'>
  | NatError<'CreateAction.PublishPinnableGlobalContract.Internal'>;

export type SafeCreatePublishPinnableGlobalContractAction = (
  args: CreatePublishPinnableGlobalContractActionArgs,
) => Result<PublishPinnableGlobalContractAction, CreatePublishPinnableGlobalContractActionError>;

export type CreatePublishPinnableGlobalContractAction = (
  args: CreatePublishPinnableGlobalContractActionArgs,
) => PublishPinnableGlobalContractAction;

// ****** NEARCORE ********

export type NearcorePublishPinnableGlobalContractAction = {
  deployGlobalContract: {
    code: Uint8Array;
    deployMode: { codeHash: {} };
  };
};
