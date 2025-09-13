import type {
  BlockHeight,
  BlockHash,
  AccountId,
  BlockReference,
} from 'nat-types/common';
import type { AccountKey } from 'nat-types/accountKey';
import type { ClientContext } from 'nat-types/client/client';

export type GetAccountKeysArgs = {
  accountId: AccountId;
  atMomentOf?: BlockReference;
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
