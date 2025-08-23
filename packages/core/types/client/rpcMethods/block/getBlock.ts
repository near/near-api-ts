import type { BlockTarget } from 'nat-types/common';
import type { RpcBlockResponse } from '@near-js/jsonrpc-types';
import type { ClientContext } from 'nat-types/client/client';

type Input = {
  options?: BlockTarget;
};

type Output = RpcBlockResponse;

export type GetBlock = (input?: Input) => Promise<Output>;

export type CreateGetBlock = (clientContext: ClientContext) => GetBlock;
