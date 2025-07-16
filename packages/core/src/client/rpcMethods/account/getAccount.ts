import { getBlockTarget } from '../utils.js';
import type { BlockId, Finality } from '@near-api-ts/types';
import type { SendRequest } from '../../createSendRequest.js';

// https://docs.near.org/api/rpc/contracts#view-account

type GetAccountArgs = {
  accountId: string;
  options?: {
    finality?: Finality;
    blockId?: BlockId;
  };
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

type GetAccount = (args: GetAccountArgs) => Promise<GetAccountResult>;

export const createGetAccount =
  (sendRequest: SendRequest): GetAccount =>
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
