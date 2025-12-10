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
import type { SendRequestErrorVariant } from 'nat-types/client/transport/sendRequest';
import type { CommonRpcQueryMethodErrorVariant } from 'nat-types/client/methods/_common/query';
import type { CommonRpcMethodErrorVariant } from 'nat-types/client/methods/_common/common';
import type { RpcQueryViewAccountResult } from '../../../../src/client/methods/account/getAccountInfo/handleResult';

export type GetAccountInfoErrorVariant =
  | SendRequestErrorVariant<'Client.GetAccountInfo'>
  | CommonRpcMethodErrorVariant<'Client.GetAccountInfo'>
  | CommonRpcQueryMethodErrorVariant<'Client.GetAccountInfo'>
  | {
      kind: 'Client.GetAccountInfo.Rpc.Account.NotFound';
      context: {
        accountId: AccountId;
        blockHash: BlockHash;
        blockHeight: BlockHeight;
      };
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
  rawRpcResult: RpcQueryViewAccountResult;
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
  // Rpc - query - common
  | NatError<'Client.GetAccountInfo.Rpc.NotSynced'>
  | NatError<'Client.GetAccountInfo.Rpc.Shard.NotTracked'>
  | NatError<'Client.GetAccountInfo.Rpc.Block.GarbageCollected'>
  | NatError<'Client.GetAccountInfo.Rpc.Block.NotFound'>
  | NatError<'Client.GetAccountInfo.Rpc.Internal'>
  // Rpc - query - view_account
  | NatError<'Client.GetAccountInfo.Rpc.Account.NotFound'>
  // Stub
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
