import { getBlockTarget } from '../utils';
import type { CreateGetBlock } from 'nat-types/client/rpcMethods/block/getBlock';

export const createGetBlock: CreateGetBlock =
  ({ sendRequest }) =>
  (params) =>
    sendRequest({
      body: {
        method: 'block',
        params: getBlockTarget(params?.options),
      },
    });
