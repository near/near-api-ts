import type { NatError } from '../../../../../src/_common/_common/_common/_common/natError';
import type { Base64String, Result } from '../../../common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../natError';

export interface CreatePublishLinkableGlobalContractActionPublicErrorRegistry {
  'CreateAction.PublishLinkableGlobalContract.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.PublishLinkableGlobalContract.Internal': InternalErrorContext;
}

type WasmU8 = { wasmU8: Uint8Array; wasmBase64?: never };
type WasmBase64 = { wasmU8?: never; wasmBase64: Base64String };

export type CreatePublishLinkableGlobalContractActionArgs = WasmU8 | WasmBase64;

/**
 * Publishes replaceable contract code to the chain without attaching it to the
 * publisher's own account. The code is addressed by the publisher's account id
 * and can be adopted by any account with a `LinkGlobalContract` action.
 *
 * Publishing new linkable code from the same account updates every account
 * linked to it. The publisher pays for the code storage once, up front.
 */
export type PublishLinkableGlobalContractAction = {
  actionType: 'PublishLinkableGlobalContract';
  wasmU8: Uint8Array;
};

type CreatePublishLinkableGlobalContractActionError =
  | NatError<'CreateAction.PublishLinkableGlobalContract.Args.InvalidSchema'>
  | NatError<'CreateAction.PublishLinkableGlobalContract.Internal'>;

export type SafeCreatePublishLinkableGlobalContractAction = (
  args: CreatePublishLinkableGlobalContractActionArgs,
) => Result<PublishLinkableGlobalContractAction, CreatePublishLinkableGlobalContractActionError>;

export type CreatePublishLinkableGlobalContractAction = (
  args: CreatePublishLinkableGlobalContractActionArgs,
) => PublishLinkableGlobalContractAction;

// ****** NEARCORE ********

export type NearcorePublishLinkableGlobalContractAction = {
  deployGlobalContract: {
    code: Uint8Array;
    deployMode: { accountId: {} };
  };
};
