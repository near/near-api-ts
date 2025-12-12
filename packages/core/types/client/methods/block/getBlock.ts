import type { BlockReference, Result } from 'nat-types/_common/common';
import type { RpcBlockResponse } from '@near-js/jsonrpc-types';
import type { ClientContext } from 'nat-types/client/client';
import type { PartialTransportPolicy } from 'nat-types/client/transport/transport';
import type { SendRequestErrorVariant } from 'nat-types/client/transport/sendRequest';
import type { CommonRpcMethodErrorVariant } from 'nat-types/client/methods/_common/common';
import type { NatError } from '@common/natError';

export type GetBlockErrorVariant =
  | SendRequestErrorVariant<'Client.GetBlock'>
  | CommonRpcMethodErrorVariant<'Client.GetBlock'>
  | {
      kind: `Client.GetBlock.Rpc.NotSynced`;
      context: null;
    }
  | {
      kind: 'Client.GetBlock.Rpc.Block.NotFound';
      context: null;
    };

export type GetBlockUnknownErrorKind = 'Client.GetBlock.Unknown';

export type GetBlockArgs = {
  blockReference?: BlockReference;
  policies?: {
    transport?: PartialTransportPolicy;
  };
  options?: {
    signal?: AbortSignal;
  };
};

export type GetBlockOutcome = {
  rawRpcResult: RpcBlockResponse;
};

type GetBlockError =
  // Function Arguments
  | NatError<'Client.GetBlock.Args.InvalidSchema'>
  // Transport
  | NatError<'Client.GetBlock.PreferredRpc.NotFound'>
  | NatError<'Client.GetBlock.Request.FetchFailed'>
  | NatError<'Client.GetBlock.Request.Attempt.Timeout'>
  | NatError<'Client.GetBlock.Request.Timeout'>
  | NatError<'Client.GetBlock.Request.Aborted'>
  | NatError<'Client.GetBlock.Response.JsonParseFailed'>
  | NatError<'Client.GetBlock.Response.InvalidSchema'>
  // Rpc - block
  | NatError<'Client.GetBlock.Rpc.NotSynced'>
  | NatError<'Client.GetBlock.Rpc.Block.NotFound'>
  // Stub
  | NatError<'Client.GetBlock.Rpc.Internal'>
  | NatError<'Client.GetBlock.Unknown'>;

export type SafeGetBlock = (
  args?: GetBlockArgs,
) => Promise<Result<GetBlockOutcome, GetBlockError>>;

export type GetBlock = (args?: GetBlockArgs) => Promise<GetBlockOutcome>;

export type CreateSafeGetBlock = (clientContext: ClientContext) => SafeGetBlock;
