import type { BlockTarget, AccountId } from 'nat-types/common';
import type { ClientContext } from 'nat-types/client/client';

type Input = {
  accountId: AccountId;
  options?: BlockTarget;
};

type Output = any;

export type GetAccount = (input: Input) => Promise<Output>;
export type CreateGetAccount = (clientContext: ClientContext) => GetAccount;
