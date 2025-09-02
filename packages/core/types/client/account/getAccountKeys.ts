import type {
  BlockHeight,
  BlockHash,
  AccountId,
  BlockReference,
} from 'nat-types/common';
import type { AccountKey } from 'nat-types/accountKey';
import type { ClientContext } from 'nat-types/client/client';

type GetAccountKeysArgs = {
  accountId: AccountId;
  blockReference?: BlockReference;
};

export type GetAccountKeysResult = {
  blockHash: BlockHash;
  blockHeight: BlockHeight;
  accountKeys: AccountKey[];
};

export type GetAccountKeys = (
  args: GetAccountKeysArgs,
) => Promise<GetAccountKeysResult>;

export type CreateGetAccountKeys = (
  clientContext: ClientContext,
) => GetAccountKeys;
