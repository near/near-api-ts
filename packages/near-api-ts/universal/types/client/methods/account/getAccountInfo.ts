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
import type { CommonRpcQueryMethodErrorVariant } from '../_common/query';
import type { CommonRpcMethodErrorVariant } from '../_common/common';
import type { RpcQueryViewAccountResult } from '../../../../src/client/methods/account/getAccountInfo/handleResult/handleResult';

export type GetAccountInfoErrorVariant =
  | CommonRpcMethodErrorVariant<'Client.GetAccountInfo'>
  | CommonRpcQueryMethodErrorVariant<'Client.GetAccountInfo'>
  | {
      kind: 'Client.GetAccountInfo.Rpc.Account.NotFound';
      context: {
        accountId: AccountId;
        blockHash: BlockHash;
        blockHeight: BlockHeight;
      };
    }
  | {
      kind: 'Client.GetAccountInfo.StoragePricePerByte.NotLoaded';
      context: { cause: unknown };
    };

export type GetAccountInfoInternalErrorKind = 'Client.GetAccountInfo.Internal';

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
  | NatError<'Client.GetAccountInfo.SendRequest.Failed'>
  | NatError<'Client.GetAccountInfo.StoragePricePerByte.NotLoaded'>
  // Rpc - query
  | NatError<'Client.GetAccountInfo.Rpc.NotSynced'>
  | NatError<'Client.GetAccountInfo.Rpc.Shard.NotTracked'>
  | NatError<'Client.GetAccountInfo.Rpc.Block.GarbageCollected'>
  | NatError<'Client.GetAccountInfo.Rpc.Block.NotFound'>
  | NatError<'Client.GetAccountInfo.Rpc.Account.NotFound'>
  // Stub
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
