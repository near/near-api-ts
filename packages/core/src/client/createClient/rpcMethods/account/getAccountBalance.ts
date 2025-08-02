import { getAccount } from './getAccount';
import { getProtocolConfig } from '../protocol/getProtocolConfig';
import type { BlockTarget } from '@types';
import type { ClientMethodContext } from '../../createClient';

type GetAccountBalanceArgs = {
  accountId: string;
  options?: BlockTarget;
};

type GetAccountBalanceResult = object;

export type GetAccountBalance = (
  args: GetAccountBalanceArgs,
) => Promise<GetAccountBalanceResult>;

export const getAccountBalance =
  (context: ClientMethodContext): GetAccountBalance =>
  async (args) => {
    const [config, account] = await Promise.all([
      getProtocolConfig(context)(args),
      getAccount(context)(args),
    ]);

    // @ts-ignore
    const costPerByte = BigInt(config.runtimeConfig.storageAmountPerByte);
    const stateStaked = BigInt(account.storageUsage) * costPerByte;
    const staked = BigInt(account.locked);
    const totalBalance = BigInt(account.amount) + staked;
    const availableBalance =
      totalBalance - (staked > stateStaked ? staked : stateStaked);

    return {
      total: totalBalance.toString(),
      stateStaked: stateStaked.toString(),
      staked: staked.toString(),
      available: availableBalance.toString(),
    };
  };
