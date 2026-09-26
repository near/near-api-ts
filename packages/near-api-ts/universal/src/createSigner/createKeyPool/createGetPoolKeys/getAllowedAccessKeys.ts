import type { AccountAccessKey } from '../../../../types/_common/accountAccessKey';
import type { CreateMemorySignerArgs } from '../../../../types/signer/createMemorySigner';
import { toPublicKeyRef } from '../../../_common/toPublicKeyRef';
import { PublicKeyZodSchema } from '../../../_common/zodSchemas/publicKey';

export const getAllowedAccessKeys = (
  accountAccessKeys: AccountAccessKey[],
  createMemorySignerArgs: CreateMemorySignerArgs,
) => {
  const whitelist = createMemorySignerArgs?.keyPool?.allowedAccessKeys;

  // We are sure that signingKeys contains at least 1 key if present;
  if (!whitelist) return accountAccessKeys;

  // The account refers to its keys by ref, so compare the whitelisted keys by ref too;
  // createMemorySigner has already validated them
  const set = new Set(
    whitelist.map((publicKey) => toPublicKeyRef(PublicKeyZodSchema.parse(publicKey))),
  );
  return accountAccessKeys.filter((key) => set.has(key.publicKeyRef));
};
