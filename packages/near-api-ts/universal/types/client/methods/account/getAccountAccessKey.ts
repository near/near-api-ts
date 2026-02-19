import type { PublicKey } from '../../../_common/crypto';
import type { AccountAccessKey } from '../../../_common/accountAccessKey';
import type {
  AccountId,
  BlockHash,
  BlockHeight,
  BlockReference,
  Result,
} from '../../../_common/common';
import type { ClientContext } from '../../client';
import type { PartialTransportPolicy } from '../../transport/transport';
import type { NatError } from '../../../../src/_common/natError';
import type {
  RpcQueryBlockGarbageCollectedErrorContext,
  RpcQueryBlockNotFoundErrorContext,
  RpcQueryNotSyncedErrorContext,
  RpcQueryShardNotTrackedErrorContext,
} from '../_common/common';
import type { RpcQueryViewAccessKeyOkResult } from '../../../../src/client/methods/account/getAccountAccessKey/handleResult';
import type {
  InternalErrorContext,
  InvalidSchemaErrorContext,
} from '@universal/types/natError';
import type {
  AbortedErrorContext,
  ExhaustedErrorContext,
  PreferredRpcNotFoundErrorContext,
  TimeoutErrorContext,
} from '@universal/types/client/transport/sendRequest';

export interface GetAccountAccessKeyPublicErrorRegistry {
  'Client.GetAccountAccessKey.Args.InvalidSchema': InvalidSchemaErrorContext;
  'Client.GetAccountAccessKey.PreferredRpc.NotFound': PreferredRpcNotFoundErrorContext;
  'Client.GetAccountAccessKey.Timeout': TimeoutErrorContext;
  'Client.GetAccountAccessKey.Aborted': AbortedErrorContext;
  'Client.GetAccountAccessKey.Exhausted': ExhaustedErrorContext;
  'Client.GetAccountAccessKey.Rpc.AccountAccessKey.NotFound': {
    accountId: AccountId;
    publicKey: PublicKey;
    blockHash: BlockHash;
    blockHeight: BlockHeight;
  };
  'Client.GetAccountAccessKey.Rpc.NotSynced': RpcQueryNotSyncedErrorContext;
  'Client.GetAccountAccessKey.Rpc.Shard.NotTracked': RpcQueryShardNotTrackedErrorContext;
  'Client.GetAccountAccessKey.Rpc.Block.GarbageCollected': RpcQueryBlockGarbageCollectedErrorContext;
  'Client.GetAccountAccessKey.Rpc.Block.NotFound': RpcQueryBlockNotFoundErrorContext;
  'Client.GetAccountAccessKey.Internal': InternalErrorContext;
}

export type GetAccountAccessKeyArgs = {
  accountId: AccountId;
  publicKey: PublicKey;
  atMomentOf?: BlockReference;
  policies?: {
    transport?: PartialTransportPolicy;
  };
  options?: {
    signal?: AbortSignal;
  };
};

export type GetAccountAccessKeyOutput = {
  blockHash: BlockHash;
  blockHeight: BlockHeight;
  accountId: AccountId;
  accountAccessKey: AccountAccessKey;
  rawRpcResult: RpcQueryViewAccessKeyOkResult;
};

type GetAccountAccessKeyError =
  | NatError<'Client.GetAccountAccessKey.Args.InvalidSchema'>
  | NatError<'Client.GetAccountAccessKey.PreferredRpc.NotFound'>
  | NatError<'Client.GetAccountAccessKey.Timeout'>
  | NatError<'Client.GetAccountAccessKey.Aborted'>
  | NatError<'Client.GetAccountAccessKey.Exhausted'>
  // Rpc - query
  | NatError<'Client.GetAccountAccessKey.Rpc.NotSynced'>
  | NatError<'Client.GetAccountAccessKey.Rpc.Shard.NotTracked'>
  | NatError<'Client.GetAccountAccessKey.Rpc.Block.GarbageCollected'>
  | NatError<'Client.GetAccountAccessKey.Rpc.Block.NotFound'>
  | NatError<'Client.GetAccountAccessKey.Rpc.AccountAccessKey.NotFound'>
  // Stub
  | NatError<'Client.GetAccountAccessKey.Internal'>;

export type SafeGetAccountAccessKey = (
  args: GetAccountAccessKeyArgs,
) => Promise<Result<GetAccountAccessKeyOutput, GetAccountAccessKeyError>>;

export type GetAccountAccessKey = (
  args: GetAccountAccessKeyArgs,
) => Promise<GetAccountAccessKeyOutput>;

export type CreateSafeGetAccountAccessKey = (
  clientContext: ClientContext,
) => SafeGetAccountAccessKey;
