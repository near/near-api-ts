import { getBlockTarget } from '../utils';
import type { CreateGetAccount } from 'nat-types/client/rpcMethods/account/getAccount';

export const createGetAccount: CreateGetAccount =
  ({ sendRequest }) =>
  ({ accountId, options }) =>
    sendRequest({
      body: {
        method: 'query',
        params: {
          request_type: 'view_account',
          account_id: accountId,
          ...getBlockTarget(options),
        },
      },
    });
