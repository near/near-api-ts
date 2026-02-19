import type { RpcBlockResponse } from '@near-js/jsonrpc-types';
import type { NatError } from '@universal/src/_common/natError';
import type { AbortedErrorContext, ExhaustedErrorContext, PreferredRpcNotFoundErrorContext, TimeoutErrorContext } from '@universal/types/client/transport/sendRequest';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '@universal/types/natError';
import type { BlockReference, Result } from '../../../_common/common';
import type { ClientContext } from '../../client';
import type { PartialTransportPolicy } from '../../transport/transport';
import type { RpcQueryNotSyncedErrorContext } from '../_common/common';

export interface GetBlockPublicErrorRegistry {
  'Client.GetBlock.Args.InvalidSchema': InvalidSchemaErrorContext;
  'Client.GetBlock.PreferredRpc.NotFound': PreferredRpcNotFoundErrorContext;
  'Client.GetBlock.Timeout': TimeoutErrorContext;
  'Client.GetBlock.Aborted': AbortedErrorContext;
  'Client.GetBlock.Exhausted': ExhaustedErrorContext;
  'Client.GetBlock.Rpc.NotSynced': RpcQueryNotSyncedErrorContext;
  'Client.GetBlock.Rpc.Block.NotFound': null;
  'Client.GetBlock.Internal': InternalErrorContext;
}

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

export type GetBlockError =
  | NatError<'Client.GetBlock.Args.InvalidSchema'>
  | NatError<'Client.GetBlock.PreferredRpc.NotFound'>
  | NatError<'Client.GetBlock.Timeout'>
  | NatError<'Client.GetBlock.Aborted'>
  | NatError<'Client.GetBlock.Exhausted'>
  | NatError<'Client.GetBlock.Rpc.NotSynced'>
  | NatError<'Client.GetBlock.Rpc.Block.NotFound'>
  | NatError<'Client.GetBlock.Internal'>;

export type SafeGetBlock = (
  args?: GetBlockArgs,
) => Promise<Result<GetBlockOutcome, GetBlockError>>;

export type GetBlock = (args?: GetBlockArgs) => Promise<GetBlockOutcome>;

export type CreateSafeGetBlock = (clientContext: ClientContext) => SafeGetBlock;
