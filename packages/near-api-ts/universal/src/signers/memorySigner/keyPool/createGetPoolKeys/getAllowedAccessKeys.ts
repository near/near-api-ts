import type { AccountAccessKey } from '@universal/types/_common/accountAccessKey';
import type { CreateMemorySignerArgs } from '@universal/types/signers/memorySigner/public/createMemorySigner';

export const getAllowedAccessKeys = (
  accountAccessKeys: AccountAccessKey[],
  createMemorySignerArgs: CreateMemorySignerArgs,
) => {
  const whitelist = createMemorySignerArgs?.keyPool?.allowedAccessKeys;

  // We are sure that signingKeys contains at least 1 key if present;
  if (!whitelist) return accountAccessKeys;

  const set = new Set(whitelist);
  return accountAccessKeys.filter((key) => set.has(key.publicKey));
};
