import { getBlockTarget } from '../utils.js';
import type { BlockId, Finality } from '@near-api-ts/types';
import type { SendRequest } from '../../createSendRequest.js';

// https://docs.near.org/api/rpc/access-keys#view-access-key

type GetAccountKeyArgs = {
  accountId: string;
  publicKey: string;
  options?: {
    finality?: Finality;
    blockId?: BlockId;
  };
};

// TODO use generated type
type GetAccountKeyResult = {
  blockHash: string;
  blockHeight: number;
  nonce: number;
  permission: string;
};

type GetAccountKey = (args: GetAccountKeyArgs) => Promise<GetAccountKeyResult>;

export const createGetAccountKey =
  (sendRequest: SendRequest): GetAccountKey =>
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
