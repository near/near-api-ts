import type { BlockReference } from 'nat-types/common';
import type { RpcBlockResponse } from '@near-js/jsonrpc-types';
import type { ClientContext } from 'nat-types/client/client';

export type GetBlockArgs = {
  blockReference?: BlockReference;
};

export type GetBlockResult = RpcBlockResponse;

export type GetBlock = (args?: GetBlockArgs) => Promise<GetBlockResult>;

export type CreateGetBlock = (clientContext: ClientContext) => GetBlock;
