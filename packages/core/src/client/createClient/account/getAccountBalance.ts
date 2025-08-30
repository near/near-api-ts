import { createGetAccount } from './getAccount';
import { createGetProtocolConfig } from '../protocol/getProtocolConfig';
import type { CreateGetAccountBalance } from 'nat-types/client/account/getAccountBalance';

export const createGetAccountBalance: CreateGetAccountBalance =
  (clientContext) => async (args) => {
    const [config, account] = await Promise.all([
      createGetProtocolConfig(clientContext)(args),
      createGetAccount(clientContext)(args),
    ]);

    // TODO Rework
    // @ts-ignore
    const costPerByte = BigInt(config?.runtimeConfig?.storageAmountPerByte);
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
