import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import type { CreateGetAccount } from 'nat-types/client/account/getAccount';

export const createGetAccount: CreateGetAccount =
  ({ sendRequest }) =>
  (args) =>
    sendRequest({
      body: {
        method: 'query',
        params: {
          request_type: 'view_account',
          account_id: args.accountId,
          ...toNativeBlockReference(args.blockReference),
        },
      },
    });
