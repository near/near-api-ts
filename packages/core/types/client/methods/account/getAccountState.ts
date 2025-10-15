import type {
  AccountId,
  CryptoHash,
  BlockHash,
  BlockHeight,
  NearToken,
  BlockReference,
} from 'nat-types/common';
import type { ClientContext } from 'nat-types/client/client';

export type GetAccountStateArgs = {
  accountId: AccountId;
  atMomentOf?: BlockReference;
};

export type GetAccountStateResult = {
  blockHash: BlockHash;
  blockHeight: BlockHeight;
  accountId: AccountId;
  accountState: {
    balance: {
      total: NearToken;
      locked: NearToken;
    };
    usedStorageBytes: number;
    contractHash: CryptoHash | null;
    globalContractHash: CryptoHash | null;
    globalContractAccountId: AccountId | null;
  };
};

export type GetAccountState = (
  args: GetAccountStateArgs,
) => Promise<GetAccountStateResult>;

export type CreateGetAccountState = (
  clientContext: ClientContext,
) => GetAccountState;
