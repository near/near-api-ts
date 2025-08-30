import { createGetAccountState } from './getAccountState';
import { createGetProtocolConfig } from '../protocol/getProtocolConfig';
import type { CreateGetAccountBalance } from 'nat-types/client/account/getAccountBalance';

// TODO Remove this method, extend getAccountState

export const createGetAccountBalance: CreateGetAccountBalance =
  (clientContext) => async (args) => {
    const [config, account] = await Promise.all([
      createGetProtocolConfig(clientContext)(args),
      createGetAccountState(clientContext)(args),
    ]);

    // TODO Rework
    // @ts-ignore
    const costPerByte = BigInt(config?.runtimeConfig?.storageAmountPerByte);
    // @ts-ignore
    const stateStaked = BigInt(account.storageUsage) * costPerByte;
    // @ts-ignore
    const staked = BigInt(account.locked);
    // @ts-ignore
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
