// Account
import { createGetAccount } from './account/getAccount.js';
import { createGetAccountBalance } from './account/getAccountBalance.js';
// Account Keys
import { createGetAccountKey } from './accountKeys/getAccountKey.js';
// Protocol
import { createGetProtocolConfig } from './protocol/getProtocolConfig.js';

export const factoryRpcMethods = {
  // Account
  getAccount: createGetAccount,
  getAccountBalance: createGetAccountBalance,
  // Account Keys
  getAccountKey: createGetAccountKey,
  // Protocol
  getProtocolConfig: createGetProtocolConfig,
};

export type FactoryRpcMethods = typeof factoryRpcMethods;

export type RpcMethods = {
  // Account
  getAccount: ReturnType<typeof createGetAccount>;
  getAccountBalance: ReturnType<typeof createGetAccountBalance>;
  // Account Keys
  getAccountKey: ReturnType<typeof createGetAccountKey>;
  // Protocol
  getProtocolConfig: ReturnType<typeof createGetProtocolConfig>;
};
