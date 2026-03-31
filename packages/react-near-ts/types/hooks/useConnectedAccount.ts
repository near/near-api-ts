import type { AccountId } from 'near-api-ts';

export type UseConnectedAccount = () =>
  | {
      connectedAccountId: AccountId;
      isConnectedAccount: true;
    }
  | {
      connectedAccountId?: never;
      isConnectedAccount: false;
    };
