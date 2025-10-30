import type {
  AccountId,
  CryptoHash,
  BlockHash,
  BlockHeight,
  BlockReference,
} from 'nat-types/common';
import type { ClientContext } from 'nat-types/client/client';
import type { PartialTransportPolicy } from 'nat-types/client/transport';
import type {NearToken} from 'nat-types/nearToken';

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
