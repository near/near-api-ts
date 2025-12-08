import type {
  AccountId,
  CryptoHash,
  BlockHash,
  BlockHeight,
  BlockReference,
  Result,
} from 'nat-types/_common/common';
import type { ClientContext } from 'nat-types/client/client';
import type { PartialTransportPolicy } from 'nat-types/client/transport/transport';
import type { NearToken } from 'nat-types/_common/nearToken';
import type { NatError } from '@common/natError';
import type {
  InvalidSchemaContext,
  UnknownErrorContext,
} from 'nat-types/natError';
import type { SendRequestErrorVariant } from 'nat-types/client/transport/sendRequest';
import type { RpcResponse } from '@common/schemas/zod/rpc';
import type { ShardId } from '@near-js/jsonrpc-types';

export type GetAccountInfoErrorVariant =
  | SendRequestErrorVariant<'Client.GetAccountInfo'>
  | {
      kind: 'Client.GetAccountInfo.Args.InvalidSchema';
      context: InvalidSchemaContext;
    }
  // Rpc general 'query' Errors
  | {
      kind: 'Client.GetAccountInfo.Rpc.NotSynced';
      context: null;
    }
  | {
      kind: 'Client.GetAccountInfo.Rpc.Shard.NotTracked';
      context: { shardId: ShardId };
    }
  | {
      kind: 'Client.GetAccountInfo.Rpc.Block.GarbageCollected';
      context: {
        blockHash: BlockHash;
        blockHeight: BlockHeight;
      };
    }
  | {
      kind: 'Client.GetAccountInfo.Rpc.Block.NotFound';
      context: {
        blockId: BlockHash | BlockHeight;
      };
    }
  | {
      kind: 'Client.GetAccountInfo.Rpc.Internal';
      context: { message: string };
    }
  // Rpc view_account errors
  | {
      kind: 'Client.GetAccountInfo.Rpc.Account.NotFound';
      context: {
        accountId: AccountId;
        blockHash: BlockHash;
        blockHeight: BlockHeight;
      };
    }
  // Stub
  | {
      kind: 'Client.GetAccountInfo.Rpc.Unclassified';
      context: { rawRpcResponse: RpcResponse };
    }
  | {
      kind: 'Client.GetAccountInfo.Unknown';
      context: UnknownErrorContext;
    };

export type GetAccountInfoUnknownErrorKind = 'Client.GetAccountInfo.Unknown';

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
      locked: NearToken;
    };
    usedStorageBytes: number;
    contractHash?: CryptoHash;
    globalContractHash?: CryptoHash;
    globalContractAccountId?: AccountId;
  };
  rawRpcResponse: RpcResponse;
};

type GetAccountInfoError =
  // Function Arguments
  | NatError<'Client.GetAccountInfo.Args.InvalidSchema'>
  // Transport
  | NatError<'Client.GetAccountInfo.PreferredRpc.NotFound'>
  | NatError<'Client.GetAccountInfo.Request.FetchFailed'>
  | NatError<'Client.GetAccountInfo.Request.Attempt.Timeout'>
  | NatError<'Client.GetAccountInfo.Request.Timeout'>
  | NatError<'Client.GetAccountInfo.Request.Aborted'>
  | NatError<'Client.GetAccountInfo.Response.JsonParseFailed'>
  | NatError<'Client.GetAccountInfo.Response.InvalidSchema'>
  // Rpc
  | NatError<'Client.GetAccountInfo.Rpc.NotSynced'>
  | NatError<'Client.GetAccountInfo.Rpc.Shard.NotTracked'>
  | NatError<'Client.GetAccountInfo.Rpc.Block.GarbageCollected'>
  | NatError<'Client.GetAccountInfo.Rpc.Block.NotFound'>
  | NatError<'Client.GetAccountInfo.Rpc.Account.NotFound'>
  | NatError<'Client.GetAccountInfo.Rpc.Internal'>
  // Stub
  | NatError<'Client.GetAccountInfo.Rpc.Unclassified'>
  | NatError<'Client.GetAccountInfo.Unknown'>;

export type SafeGetAccountInfo = (
  args: GetAccountInfoArgs,
) => Promise<Result<GetAccountInfoOutput, GetAccountInfoError>>;

export type GetAccountInfo = (
  args: GetAccountInfoArgs,
) => Promise<GetAccountInfoOutput>;

export type CreateSafeGetAccountInfo = (
  clientContext: ClientContext,
) => SafeGetAccountInfo;
