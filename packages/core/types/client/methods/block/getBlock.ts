import type { BlockReference } from 'nat-types/_common/common';
import type { RpcBlockResponse } from '@near-js/jsonrpc-types';
import type { ClientContext } from 'nat-types/client/client';
import type { PartialTransportPolicy } from 'nat-types/client/transport';

export type GetBlockArgs = {
  blockReference?: BlockReference;
  policies?: {
    transport?: PartialTransportPolicy;
  };
  options?: {
    signal?: AbortSignal;
  };
};

export type GetBlockResult = RpcBlockResponse;

export type GetBlock = (args?: GetBlockArgs) => Promise<GetBlockResult>;

export type CreateGetBlock = (clientContext: ClientContext) => GetBlock;
