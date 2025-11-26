import type {
  BlockHeight,
  BlockHash,
  AccountId,
  BlockReference,
} from 'nat-types/_common/common';
import type { AccountKey } from 'nat-types/_common/accountKey';
import type { ClientContext } from 'nat-types/client/client';
import type { PartialTransportPolicy } from 'nat-types/client/transport';

export type GetAccountKeysArgs = {
  accountId: AccountId;
  atMomentOf?: BlockReference;
  policies?: {
    transport?: PartialTransportPolicy;
  };
  options?: {
    signal?: AbortSignal;
  };
};

export type GetAccountKeysResult = {
  blockHash: BlockHash;
  blockHeight: BlockHeight;
  accountId: AccountId;
  accountKeys: AccountKey[];
};

export type GetAccountKeys = (
  args: GetAccountKeysArgs,
) => Promise<GetAccountKeysResult>;

export type CreateGetAccountKeys = (
  clientContext: ClientContext,
) => GetAccountKeys;
