import type { BlockReference, Result } from '../../../_common/common';
import type { RpcBlockResponse } from '@near-js/jsonrpc-types';
import type { ClientContext } from '../../client';
import type { PartialTransportPolicy } from '../../transport/transport';
import type { NatError } from '../../../../src/_common/natError';
import type { CommonRpcMethodErrorVariant } from '../_common/common';

export type GetBlockErrorVariant =
  | CommonRpcMethodErrorVariant<'Client.GetBlock'>
  | {
      kind: `Client.GetBlock.Rpc.NotSynced`;
      context: null;
    }
  | {
      kind: 'Client.GetBlock.Rpc.Block.NotFound';
      context: null;
    };

export type GetBlockInternalErrorKind = 'Client.GetBlock.Internal';

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
  | NatError<'Client.GetBlock.SendRequest.Failed'>
  | NatError<'Client.GetBlock.Rpc.NotSynced'>
  | NatError<'Client.GetBlock.Rpc.Block.NotFound'>
  | NatError<'Client.GetBlock.Internal'>;

export type SafeGetBlock = (
  args?: GetBlockArgs,
) => Promise<Result<GetBlockOutcome, GetBlockError>>;

export type GetBlock = (args?: GetBlockArgs) => Promise<GetBlockOutcome>;

export type CreateSafeGetBlock = (clientContext: ClientContext) => SafeGetBlock;
