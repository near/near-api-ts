import type { NatError } from '../../../../src/_common/natError';
import type {
  AccountId,
  BlockHash,
  BlockHeight,
  BlockReference,
  CryptoHash,
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
  contractWasmHash: CryptoHash | null;
  globalContractWasmHash: CryptoHash | null;
  globalContractAccountId: AccountId | null;
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
