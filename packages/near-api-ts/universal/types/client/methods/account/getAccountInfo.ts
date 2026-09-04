import type { NatError } from '../../../../src/_common/_common/_common/_common/natError';
import type {
  AccountId,
  BlockHash,
  BlockHeight,
  BlockReference,
  ContractWasmHash,
  Result,
} from '../../../_common/common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../_common/natError';
import type { NearToken } from '../../../_common/nearToken';
import type { ClientContext } from '../../client';
import type {
  AbortedErrorContext,
  ExhaustedErrorContext,
  PreferredRpcNotFoundErrorContext,
  TimeoutErrorContext,
} from '../../transport/sendRequest';
import type { PartialTransportPolicy } from '../../transport/transport';
import type {
  RpcQueryBlockGarbageCollectedErrorContext,
  RpcQueryBlockNotFoundErrorContext,
  RpcQueryNotSyncedErrorContext,
} from '../_common/common';

export interface GetAccountInfoPublicErrorRegistry {
  'Client.GetAccountInfo.Args.InvalidSchema': InvalidSchemaErrorContext;
  'Client.GetAccountInfo.StoragePricePerByte.NotLoaded': { cause: unknown };
  'Client.GetAccountInfo.PreferredRpc.NotFound': PreferredRpcNotFoundErrorContext;
  'Client.GetAccountInfo.Timeout': TimeoutErrorContext;
  'Client.GetAccountInfo.Aborted': AbortedErrorContext;
  'Client.GetAccountInfo.Exhausted': ExhaustedErrorContext;
  'Client.GetAccountInfo.Rpc.Account.NotFound': {
    accountId: AccountId;
    blockHash: BlockHash;
    blockHeight: BlockHeight;
  };
  'Client.GetAccountInfo.Rpc.NotSynced': RpcQueryNotSyncedErrorContext;
  'Client.GetAccountInfo.Rpc.Block.GarbageCollected': RpcQueryBlockGarbageCollectedErrorContext;
  'Client.GetAccountInfo.Rpc.Block.NotFound': RpcQueryBlockNotFoundErrorContext;
  'Client.GetAccountInfo.Internal': InternalErrorContext;
}

export type GetAccountInfoArgs = {
  accountId: AccountId;
  atMomentOf?: BlockReference;
  policies?: {
    transport?: PartialTransportPolicy;
  };
  options?: {
    signal?: AbortSignal;
  };
};

/**
 * Which contract code the account runs.
 *
 * - `NoContract` - the account has no contract at all.
 * - `Deployed` - the account carries its own wasm, put there by a
 *   `DeployContract` action.
 * - `Pinned` - the account runs one exact global wasm (`PinGlobalContract`).
 *   Nobody can swap the code under it.
 * - `Linked` - the account runs whatever code the registrar account currently
 *   holds (`LinkGlobalContract`), so it changes when the registrar registers new
 *   code under the same account id with `RegisterLinkableGlobalContract`.
 */
export type AccountContract =
  | {
      status: 'NoContract';
    }
  | {
      status: 'Deployed';
      localContractWasmHash: ContractWasmHash;
    }
  | {
      status: 'Pinned';
      globalContractWasmHash: ContractWasmHash;
    }
  | {
      status: 'Linked';
      globalContractAccountId: AccountId;
    };

export type GetAccountInfoOutput = {
  accountId: AccountId;
  balance: {
    total: NearToken;
    available: NearToken;
    locked: {
      total: NearToken;
      validatorStake: NearToken;
      storageDeposit: NearToken;
    };
  };
  usedStorageBytes: number;
  contract: AccountContract;
  atMomentOf: {
    blockHash: BlockHash;
    blockHeight: BlockHeight;
  };
};

export type GetAccountInfoError =
  | NatError<'Client.GetAccountInfo.Args.InvalidSchema'>
  | NatError<'Client.GetAccountInfo.StoragePricePerByte.NotLoaded'>
  | NatError<'Client.GetAccountInfo.PreferredRpc.NotFound'>
  | NatError<'Client.GetAccountInfo.Timeout'>
  | NatError<'Client.GetAccountInfo.Aborted'>
  | NatError<'Client.GetAccountInfo.Exhausted'>
  | NatError<'Client.GetAccountInfo.Rpc.NotSynced'>
  | NatError<'Client.GetAccountInfo.Rpc.Block.GarbageCollected'>
  | NatError<'Client.GetAccountInfo.Rpc.Block.NotFound'>
  | NatError<'Client.GetAccountInfo.Rpc.Account.NotFound'>
  | NatError<'Client.GetAccountInfo.Internal'>;

export type SafeGetAccountInfo = (
  args: GetAccountInfoArgs,
) => Promise<Result<GetAccountInfoOutput, GetAccountInfoError>>;

export type GetAccountInfo = (args: GetAccountInfoArgs) => Promise<GetAccountInfoOutput>;

export type CreateSafeGetAccountInfo = (clientContext: ClientContext) => SafeGetAccountInfo;
