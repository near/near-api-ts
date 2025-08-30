import type { AccountId, BlockReference } from 'nat-types/common';
import type { ClientContext } from 'nat-types/client/client';

type Input = {
  accountId: AccountId;
  blockReference?: BlockReference;
};

type Output = any;

export type GetAccountBalance = (input: Input) => Promise<Output>;

export type CreateGetAccountBalance = (
  clientContext: ClientContext,
) => GetAccountBalance;
