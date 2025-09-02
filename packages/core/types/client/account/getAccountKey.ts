import type {
  AccountId,
  BlockHash,
  BlockHeight,
  BlockReference,
} from 'nat-types/common';
import type { ClientContext } from 'nat-types/client/client';
import type { PublicKey } from 'nat-types/crypto';
import type { AccountKey } from 'nat-types/accountKey';

export type GetAccountKeyArgs = {
  accountId: AccountId;
  publicKey: PublicKey;
  blockReference?: BlockReference;
};

export type GetAccountKeyResult = {
  blockHash: BlockHash;
  blockHeight: BlockHeight;
  accountKey: AccountKey;
};

export type GetAccountKey = (
  args: GetAccountKeyArgs,
) => Promise<GetAccountKeyResult>;

export type CreateGetAccountKey = (
  clientContext: ClientContext,
) => GetAccountKey;
