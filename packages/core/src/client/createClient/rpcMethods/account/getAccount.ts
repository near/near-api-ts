import { getBlockTarget } from '../utils';
import type { BlockTarget } from 'nat-types/common';
import type { ClientMethodContext } from '../../createClient';

// https://docs.near.org/api/rpc/contracts#view-account

type GetAccountArgs = {
  accountId: string;
  options?: BlockTarget;
};

// TODO use generated type
type GetAccountResult = {
  amount: string;
  blockHash: string;
  blockHeight: number;
  codeHash: string;
  locked: string;
  storagePaidAt: number;
  storageUsage: number;
};

export type GetAccount = (args: GetAccountArgs) => Promise<GetAccountResult>;

export const getAccount =
  ({ sendRequest }: ClientMethodContext): GetAccount =>
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
