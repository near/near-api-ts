import type {
  AccountId,
  CryptoHash,
  BlockHash,
  BlockHeight,
  NearToken,
  BlockReference,
} from 'nat-types/common';
import type { ClientContext } from 'nat-types/client/client';
import type { PartialTransportPolicy } from 'nat-types/client/transport';

export type GetAccountStateArgs = {
  accountId: AccountId;
  atMomentOf?: BlockReference;
  policies?: {
    transport?: PartialTransportPolicy;
  };
  options?: {
    signal?: AbortSignal;
  };
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
    contractHash?: CryptoHash;
    globalContractHash?: CryptoHash;
    globalContractAccountId?: AccountId;
  };
};

export type GetAccountState = (
  args: GetAccountStateArgs,
) => Promise<GetAccountStateResult>;

export type CreateGetAccountState = (
  clientContext: ClientContext,
) => GetAccountState;
