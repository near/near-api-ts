import type {
  AccountId,
  Base64String,
  BlockHash,
  BlockHeight,
  BlockReference,
} from 'nat-types/common';
import type { ClientContext } from 'nat-types/client/client';

export type GetContractStateArgs = {
  contractAccountId: AccountId;
  keyPrefix?: string;
  includeProof?: boolean;
  blockReference?: BlockReference;
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
