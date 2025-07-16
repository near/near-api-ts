import type { SendRequest } from '../../createSendRequest.js';
import { createGetAccount } from './getAccount.js';
import { createGetProtocolConfig } from '../protocol/getProtocolConfig.js';

type GetAccountBalanceArgs = {
  accountId: string;
  options?: {
    finality?: string; // TODO improve type - can't pass finality and blockId in the same time
    blockId?: string;
  };
};

type GetAccountBalanceResult = object;

type GetAccountBalance = (
  args: GetAccountBalanceArgs,
) => Promise<GetAccountBalanceResult>;

export const createGetAccountBalance =
  (sendRequest: SendRequest): GetAccountBalance =>
  async (args) => {
    const [config, account] = await Promise.all([
      createGetProtocolConfig(sendRequest)(args),
      createGetAccount(sendRequest)(args),
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
