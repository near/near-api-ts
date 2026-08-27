import type { NatError } from '../../../../../src/_common/_common/_common/_common/natError';
import type { AccountId, ContractWasmHash, Result } from '../../../common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../natError';

export interface CreateUseGlobalContractActionPublicErrorRegistry {
  'CreateAction.UseGlobalContract.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.UseGlobalContract.Internal': InternalErrorContext;
}

type ByWasmHash = { wasmHash: ContractWasmHash; ownerAccountId?: never };
type ByOwnerAccountId = { wasmHash?: never; ownerAccountId: AccountId };

export type CreateUseGlobalContractActionArgs = ByWasmHash | ByOwnerAccountId;

/**
 * Attaches an already registered global contract to the receiver account, the
 * way `DeployContract` attaches a wasm blob the transaction carries itself.
 *
 * Which of the two identifiers is accepted depends on how the code was
 * registered: `wasmHash` for `referenceBy: 'WasmHash'`, `ownerAccountId` for
 * `referenceBy: 'OwnerAccountId'` - see `RegisterGlobalContractAction`.
 */
export type UseGlobalContractAction = {
  actionType: 'UseGlobalContract';
} & (ByWasmHash | ByOwnerAccountId);

type CreateUseGlobalContractActionError =
  | NatError<'CreateAction.UseGlobalContract.Args.InvalidSchema'>
  | NatError<'CreateAction.UseGlobalContract.Internal'>;

export type SafeCreateUseGlobalContractAction = (
  args: CreateUseGlobalContractActionArgs,
) => Result<UseGlobalContractAction, CreateUseGlobalContractActionError>;

export type CreateUseGlobalContractAction = (
  args: CreateUseGlobalContractActionArgs,
) => UseGlobalContractAction;

// ****** NEARCORE ********

type NearcoreCodeHashIdentifier = { codeHash: Uint8Array };
type NearcoreAccountIdIdentifier = { accountId: AccountId };

export type NearcoreUseGlobalContractAction = {
  useGlobalContract: {
    contractIdentifier: NearcoreCodeHashIdentifier | NearcoreAccountIdIdentifier;
  };
};
