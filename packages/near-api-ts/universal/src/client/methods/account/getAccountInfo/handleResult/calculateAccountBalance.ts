import type { NearToken } from '../../../../../../types/_common/nearToken';
import { yoctoNear } from '../../../../../../index';
import type { RpcQueryViewAccountResult } from './handleResult';

/**
 * This function calculates account balances;
 *
 *  1.	Each account has two native balances — *amount* and *locked*.
 * *locked* shows how many tokens the account has locked in order to become a validator.
 * For the vast majority of accounts (everyone who does not want to become a validator),
 * this value will always be 0.
 * *amount* includes both tokens available for spending and tokens that may be locked for storage staking.
 *
 *  2.	Storage staking is a mechanism for paying for data storage.
 * Any account that stores more than 770 bytes must lock a certain number of tokens to pay for storage.
 * The exact amount is calculated as: used bytes × price per byte of storage.
 *
 *  3.	An account that uses 770 or fewer bytes does not pay for storage.
 * However, as soon as it uses more than 770 bytes, it must pay for all used bytes.
 * For example, if an account stores 800 bytes, it must pay for all 800 bytes, not just for the extra 30.
 *
 *  4.	When an account wants to become a validator and locks tokens for this purpose,
 *  those tokens are also counted as payment for storage.
 * For example, an account has a total of 1000 NEAR and uses 50 MB of data.
 * At current prices, 500 NEAR will be locked to pay for storage, so only 500 NEAR will be available.
 * If it then calls a stake action and locks 600 NEAR, only 400 NEAR will be available.
 * In other words, those 600 NEAR already include the 500 NEAR payment for storing 50 MB of data.
 *
 *  5.	In NAT, we display our own fields: total, available, and locked.
 * total shows all tokens owned by the account;
 * available shows how many tokens can be spent at the current moment;
 * locked shows locked tokens, regardless of whether they are locked for
 * validator staking or for storage staking.
 *
 * Examples:
 * - total: 0, available: 0, locked: 0 (storage: 770b , staked: 0)
 * - total: 1, available: 1, locked: 0 (storage: 770b, staked: 0)
 * - total: 1, available: 0.5, locked: 0.5 (storage: 770b, staked: 0.5)
 *
 * - total: 1, available: 0.5, locked: 0.5 (storage: 800b, staked: 0.5)
 * - total: 1, available: 0.25, locked: 0.75 (storage: 75Kb, staked: 0)
 * - total: 1, available: 0.25, locked: 0.75 (storage: 75Kb, staked: 0.5)
 *
 * Theoretical pitfall:
 * What happened if someone with zero cost account will try to stake, and the
 * seat price will be 1 yoctoNear? We don't expect it, cuz it doesn't make any sense
 * to have a validator stake such low; It will be much higher than 0.0077 NEAR
 * (current (27.01.2026) zero cost storage limit * current storage price)
 *
 */

const ZeroBalanceAccountStorageLimit = 770; // bytes

export const calculateAccountBalance = (
  accountInfo: RpcQueryViewAccountResult,
  storagePricePerByte: NearToken,
) => {
  const validatorStake = yoctoNear(accountInfo.locked);
  const total = yoctoNear(accountInfo.amount).add(validatorStake);

  // If an account uses 770 bytes or fewer - no storageDeposit
  if (accountInfo.storageUsage <= ZeroBalanceAccountStorageLimit)
    return {
      total,
      available: total.sub(validatorStake),
      locked: {
        amount: validatorStake,
        breakdown: {
          validatorStake,
          storageDeposit: yoctoNear(0n),
        },
      },
    };

  // If an account uses more than 770 bytes - max(storageDeposit, validatorStake) will be locked
  const storageDeposit = yoctoNear(
    storagePricePerByte.yoctoNear * BigInt(accountInfo.storageUsage),
  );
  const lockedAmount = validatorStake.gt(storageDeposit)
    ? validatorStake
    : storageDeposit;

  return {
    total,
    available: total.sub(lockedAmount),
    locked: {
      amount: lockedAmount,
      breakdown: {
        validatorStake,
        storageDeposit,
      },
    },
  };
};
