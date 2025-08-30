import type {
  AccountId,
  CryptoHash,
  BlockHash,
  BlockHeight,
  BlockReference,
  YoctoNear,
  Near,
  NearToken,
} from 'nat-types/common';
import type { ClientContext } from 'nat-types/client/client';

export type GetAccountStateArgs = {
  accountId: AccountId;
  blockReference?: BlockReference;
};

// storage_paid_at - deprecated since March 18, 2020: https://github.com/near/nearcore/issues/2271

export type GetAccountStateResult = {
  blockHash: BlockHash;
  blockHeight: BlockHeight;
  accountId: AccountId;
  accountState: {
    balance: {
      total: {
        yoctoNear: YoctoNear;
        near: Near;
      };
      locked: NearToken;
    };
    usedStorageBytes: number;
    contractWasmHash: CryptoHash;
    globalContractAccountId?: AccountId;
    globalContractHash?: CryptoHash;
  };
};

export type GetAccountState = (
  args: GetAccountStateArgs,
) => Promise<GetAccountStateResult>;
export type CreateGetAccountState = (
  clientContext: ClientContext,
) => GetAccountState;
