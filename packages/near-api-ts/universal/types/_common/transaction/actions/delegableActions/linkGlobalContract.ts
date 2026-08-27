import type { NatError } from '../../../../../src/_common/_common/_common/_common/natError';
import type { AccountId, Result } from '../../../common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../natError';

export interface CreateLinkGlobalContractActionPublicErrorRegistry {
  'CreateAction.LinkGlobalContract.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.LinkGlobalContract.Internal': InternalErrorContext;
}

export type CreateLinkGlobalContractActionArgs = {
  globalContractAccountId: AccountId;
};

/**
 * Points the receiver account at a global contract registered with
 * `wasmMutability: 'Mutable'`, the way `DeployContract` attaches a wasm blob the
 * transaction carries itself. Nearcore calls it `UseGlobalContract`.
 *
 * The link is by account id, so it follows that account: when the registrar
 * registers new code under the same account id, the receiver runs the new code
 * without sending anything itself. Use `PinGlobalContractAction` to freeze the
 * account on one exact wasm instead.
 */
export type LinkGlobalContractAction = {
  actionType: 'LinkGlobalContract';
  globalContractAccountId: AccountId;
};

type CreateLinkGlobalContractActionError =
  | NatError<'CreateAction.LinkGlobalContract.Args.InvalidSchema'>
  | NatError<'CreateAction.LinkGlobalContract.Internal'>;

export type SafeCreateLinkGlobalContractAction = (
  args: CreateLinkGlobalContractActionArgs,
) => Result<LinkGlobalContractAction, CreateLinkGlobalContractActionError>;

export type CreateLinkGlobalContractAction = (
  args: CreateLinkGlobalContractActionArgs,
) => LinkGlobalContractAction;

// ****** NEARCORE ********

export type NearcoreLinkGlobalContractAction = {
  useGlobalContract: {
    contractIdentifier: { accountId: AccountId };
  };
};
