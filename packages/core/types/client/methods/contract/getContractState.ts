import type {
  AccountId,
  Base64String,
  BlockHash,
  BlockHeight,
  BlockReference,
} from 'nat-types/_common/common';
import type { ClientContext } from 'nat-types/client/client';
import type { PartialTransportPolicy } from 'nat-types/client/transport/transport';

export type GetContractStateArgs = {
  contractAccountId: AccountId;
  atMomentOf?: BlockReference;
  keyPrefix?: string;
  includeProof?: boolean;
  policies?: {
    transport?: PartialTransportPolicy;
  };
  options?: {
    signal?: AbortSignal;
  };
};

type StateRecord = { key: Base64String; value: Base64String };

export type GetContractStateResult = {
  blockHash: BlockHash;
  blockHeight: BlockHeight;
  contractAccountId: AccountId;
  proof?: Base64String[];
  contractState: StateRecord[];
};

export type GetContractState = (
  args: GetContractStateArgs,
) => Promise<GetContractStateResult>;

export type CreateGetContractState = (
  clientContext: ClientContext,
) => GetContractState;
