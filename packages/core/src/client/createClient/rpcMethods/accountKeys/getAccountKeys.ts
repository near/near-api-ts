import { getBlockTarget } from '../utils';
import type { BlockTarget } from 'nat-types/common';
import type { ClientMethodContext } from '../../createClient';

// https://docs.near.org/api/rpc/access-keys#view-access-keys

type GetAccountKeysInput = {
  accountId: string;
  options?: BlockTarget;
};

// TODO use generated type
type GetAccountKeysOutput = {
  blockHash: string;
  blockHeight: number;
  nonce: number;
  permission: string;
};

export type GetAccountKeys = (
  args: GetAccountKeysInput,
) => Promise<GetAccountKeysOutput>;

export const getAccountKeys =
  ({ sendRequest }: ClientMethodContext): GetAccountKeys =>
  ({ accountId, options }) =>
    sendRequest({
      body: {
        method: 'query',
        params: {
          request_type: 'view_access_key_list',
          account_id: accountId,
          ...getBlockTarget(options),
        },
      },
    });
