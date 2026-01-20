import { createFindKeyForTask } from './createFindKeyForTask';
import { createIsKeyForTaskExist } from './createIsKeyForTaskExist';
import { getFullAccessKeyList } from './getFullAccessKeyList';
import { getFunctionCallKeyList } from './getFunctionCallKeyList';
import type { MemorySignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type { AccountAccessKey } from 'nat-types/_common/accountAccessKey';
import type { CreateKeyPool } from 'nat-types/signers/memorySigner/keyPool';
import { result } from '@common/utils/result';
import { createNatError } from '@common/natError';

const getAllowedSigningKeys = (
  signerContext: MemorySignerContext,
  accountKeys: AccountAccessKey[],
) => {
  // We are sure that signingKeys contains at least 1 key if present;
  if (!signerContext.signingKeys) return accountKeys;
  const set = new Set(signerContext.signingKeys);
  return accountKeys.filter((key) => set.has(key.publicKey));
};

export const createKeyPool: CreateKeyPool = async (signerContext) => {
  const accountKeys = await signerContext.client.safeGetAccountAccessKeys({
    accountId: signerContext.signerAccountId,
    atMomentOf: 'LatestFinalBlock',
  });

  if (!accountKeys.ok)
    return result.err(
      createNatError({
        kind: 'CreateMemorySigner.CreateKeyPool.Failed',
        context: { cause: accountKeys.error },
      }),
    );

  const { accountAccessKeys } = accountKeys.value;

  if (accountAccessKeys.length === 0)
    return result.err(
      createNatError({
        kind: 'CreateMemorySigner.Signer.AccessKeys.NotFound',
        context: {
          signerAccountId: signerContext.signerAccountId,
        },
      }),
    );

  // If a user wants to handle all tasks only by a specific key/s - remove others
  const filteredKeys = getAllowedSigningKeys(signerContext, accountAccessKeys);

  if (filteredKeys.length === 0)
    return result.err(
      createNatError({
        kind: 'CreateMemorySigner.KeyPool.Empty',
        context: null,
      }),
    );

  const context = {
    fullAccess: getFullAccessKeyList(filteredKeys, signerContext),
    functionCall: getFunctionCallKeyList(filteredKeys, signerContext),
  };

  return result.ok({
    findKeyForTask: createFindKeyForTask(context),
    isKeyForTaskExist: createIsKeyForTaskExist(context),
  });
};
