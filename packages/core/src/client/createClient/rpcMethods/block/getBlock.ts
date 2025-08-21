import { getBlockTarget } from '../utils';
import type { BlockTarget } from 'nat-types/common';
import type { ClientMethodContext } from '../../createClient';
import type { RpcBlockResponse } from '@psalomo/jsonrpc-types';

type GetBlockInput = {
  accountId: string;
  publicKey: string;
  options?: BlockTarget;
};

export type GetBlock = (params?: GetBlockInput) => Promise<RpcBlockResponse>;

export const getBlock =
  ({ sendRequest }: ClientMethodContext): GetBlock =>
  (params) =>
    sendRequest({
      body: {
        method: 'block',
        params: getBlockTarget(params?.options),
      },
    });
