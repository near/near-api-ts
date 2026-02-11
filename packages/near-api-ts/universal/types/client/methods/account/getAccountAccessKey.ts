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
import type { CommonRpcMethodErrorVariant } from '../_common/common';
import type { CommonRpcQueryMethodErrorVariant } from '../_common/query';
import type { RpcQueryViewAccessKeyOkResult } from '../../../../src/client/methods/account/getAccountAccessKey/handleResult';

export type GetAccountAccessKeyErrorVariant =
  | CommonRpcMethodErrorVariant<'Client.GetAccountAccessKey'>
  | CommonRpcQueryMethodErrorVariant<'Client.GetAccountAccessKey'>
  | {
      kind: 'Client.GetAccountAccessKey.Rpc.AccountAccessKey.NotFound';
      context: {
        accountId: AccountId;
        publicKey: PublicKey;
        blockHash: BlockHash;
        blockHeight: BlockHeight;
      };
    };

export type GetAccountAccessKeyInternalErrorKind =
  'Client.GetAccountAccessKey.Internal';

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
  | NatError<'Client.GetAccountAccessKey.SendRequest.Failed'>
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
