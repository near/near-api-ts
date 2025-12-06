import type {
  AccountId,
  BlockHash,
  BlockHeight,
  BlockReference,
} from 'nat-types/_common/common';
import type { ClientContext } from 'nat-types/client/client';
import type { PublicKey } from 'nat-types/_common/crypto';
import type { AccountKey } from 'nat-types/_common/accountKey';
import type { PartialTransportPolicy } from 'nat-types/client/transport/transport';

export type GetAccountKeyArgs = {
  accountId: AccountId;
  publicKey: PublicKey;
  atMomentOf?: BlockReference;
  policies?: {
    transport?: PartialTransportPolicy;
  };
  options?: {
    signal?: AbortSignal;
  };
};

export type GetAccountKeyResult = {
  blockHash: BlockHash;
  blockHeight: BlockHeight;
  accountId: AccountId;
  accountKey: AccountKey;
};

export type GetAccountKey = (
  args: GetAccountKeyArgs,
) => Promise<GetAccountKeyResult>;

export type CreateGetAccountKey = (
  clientContext: ClientContext,
) => GetAccountKey;
