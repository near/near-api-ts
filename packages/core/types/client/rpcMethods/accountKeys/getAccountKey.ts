import type { BlockTarget, AccountId } from 'nat-types/common';
import type { ClientContext } from 'nat-types/client/client';
import type { PublicKey } from 'nat-types/crypto';

type Input = {
  accountId: AccountId;
  publicKey: PublicKey;
  options?: BlockTarget;
};

type Output = any;

export type GetAccountKey = (input: Input) => Promise<Output>;

export type CreateGetAccountKey = (
  clientContext: ClientContext,
) => GetAccountKey;
