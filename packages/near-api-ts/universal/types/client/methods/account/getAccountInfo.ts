import type {
  AccountId,
  CryptoHash,
  BlockHash,
  BlockHeight,
  BlockReference,
  Result,
} from '../../../_common/common';
import type { ClientContext } from '../../client';
import type { PartialTransportPolicy } from '../../transport/transport';
import type { NearToken } from '../../../_common/nearToken';
import type { NatError } from '../../../../src/_common/natError';
import type {
  RpcQueryBlockGarbageCollectedErrorContext,
  RpcQueryBlockNotFoundErrorContext,
  RpcQueryNotSyncedErrorContext,
  RpcQueryShardNotTrackedErrorContext,
} from '../_common/common';
import type { RpcQueryViewAccountResult } from '../../../../src/client/methods/account/getAccountInfo/handleResult/handleResult';
import type {
  InternalErrorContext,
  InvalidSchemaErrorContext,
} from '@universal/types/natError';
import type {
  PreferredRpcNotFoundErrorContext,
  TimeoutErrorContext,
  AbortedErrorContext,
  ExhaustedErrorContext,
} from '@universal/types/client/transport/sendRequest';

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
  'Client.GetAccountInfo.Rpc.Shard.NotTracked': RpcQueryShardNotTrackedErrorContext;
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
  blockHash: BlockHash;
  blockHeight: BlockHeight;
  accountId: AccountId;
  accountInfo: {
    balance: {
      total: NearToken;
      available: NearToken;
      locked: {
        amount: NearToken;
        breakdown: {
          validatorStake: NearToken;
          storageDeposit: NearToken;
        };
      };
    };
    usedStorageBytes: number;
    contractHash?: CryptoHash;
    globalContractHash?: CryptoHash;
    globalContractAccountId?: AccountId;
  };
  rawRpcResult: RpcQueryViewAccountResult;
};

type GetAccountInfoError =
  | NatError<'Client.GetAccountInfo.Args.InvalidSchema'>
  | NatError<'Client.GetAccountInfo.StoragePricePerByte.NotLoaded'>
  | NatError<'Client.GetAccountInfo.PreferredRpc.NotFound'>
  | NatError<'Client.GetAccountInfo.Timeout'>
  | NatError<'Client.GetAccountInfo.Aborted'>
  | NatError<'Client.GetAccountInfo.Exhausted'>
  | NatError<'Client.GetAccountInfo.Rpc.NotSynced'>
  | NatError<'Client.GetAccountInfo.Rpc.Shard.NotTracked'>
  | NatError<'Client.GetAccountInfo.Rpc.Block.GarbageCollected'>
  | NatError<'Client.GetAccountInfo.Rpc.Block.NotFound'>
  | NatError<'Client.GetAccountInfo.Rpc.Account.NotFound'>
  | NatError<'Client.GetAccountInfo.Internal'>;

export type SafeGetAccountInfo = (
  args: GetAccountInfoArgs,
) => Promise<Result<GetAccountInfoOutput, GetAccountInfoError>>;

export type GetAccountInfo = (
  args: GetAccountInfoArgs,
) => Promise<GetAccountInfoOutput>;

export type CreateSafeGetAccountInfo = (
  clientContext: ClientContext,
) => SafeGetAccountInfo;
