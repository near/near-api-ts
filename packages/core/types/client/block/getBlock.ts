import type {BlockReference} from 'nat-types/common';
import type { RpcBlockResponse } from '@near-js/jsonrpc-types';
import type { ClientContext } from 'nat-types/client/client';

type GetBlockArgs = {
  blockReference?: BlockReference;
};

type Output = RpcBlockResponse;

export type GetBlock = (args?: GetBlockArgs) => Promise<Output>;

export type CreateGetBlock = (clientContext: ClientContext) => GetBlock;
