import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import type { CreateGetAccountKey } from 'nat-types/client/accountKeys/getAccountKey';

export const createGetAccountKey: CreateGetAccountKey =
  ({ sendRequest }) =>
  (args) =>
    sendRequest({
      body: {
        method: 'query',
        params: {
          request_type: 'view_access_key',
          account_id: args.accountId,
          public_key: args.publicKey,
          ...toNativeBlockReference(args.blockReference),
        },
      },
    });
