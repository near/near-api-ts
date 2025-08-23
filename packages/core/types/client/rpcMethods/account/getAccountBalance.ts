import type { BlockTarget, AccountId } from 'nat-types/common';
import type { ClientContext } from 'nat-types/client/client';

type Input = {
  accountId: AccountId;
  options?: BlockTarget;
};

type Output = any;

export type GetAccountBalance = (input: Input) => Promise<Output>;

export type CreateGetAccountBalance = (
  clientContext: ClientContext,
) => GetAccountBalance;
