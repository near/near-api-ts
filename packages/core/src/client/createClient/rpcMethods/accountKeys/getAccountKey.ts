import { getBlockTarget } from '../utils';
import type { BlockTarget } from '@near-api-ts/types';
import type { ClientMethodContext } from '../../createClient';

// TODO Rename to access key

// https://docs.near.org/api/rpc/access-keys#view-access-key

type GetAccountKeyArgs = {
  accountId: string;
  publicKey: string;
  options?: BlockTarget;
};

// TODO use generated type
type GetAccountKeyResult = {
  blockHash: string;
  blockHeight: number;
  nonce: number;
  permission: string;
};

export type GetAccountKey = (
  args: GetAccountKeyArgs,
) => Promise<GetAccountKeyResult>;

export const getAccountKey =
  ({ sendRequest }: ClientMethodContext): GetAccountKey =>
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
