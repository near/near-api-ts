import { getBlockTarget } from '../utils';
import type { CreateGetAccountKey } from 'nat-types/client/rpcMethods/accountKeys/getAccountKey';

export const createGetAccountKey: CreateGetAccountKey =
  ({ sendRequest }) =>
  ({ accountId, publicKey, options }) =>
    sendRequest({
      body: {
        method: 'query',
        params: {
          request_type: 'view_access_key',
          account_id: accountId,
          public_key: publicKey,
          ...getBlockTarget(options),
        },
      },
    });
