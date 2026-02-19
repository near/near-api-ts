import type { CreateKeyPool, KeyPoolState } from '@universal/types/signers/memorySigner/inner/keyPool';
import { createFindKeyForTask } from './createFindKeyForTask';
import { createGetPoolKeys } from './createGetPoolKeys/createGetPoolKeys';
import { createIsKeyForTaskExist } from './createIsKeyForTaskExist';

export const createKeyPool: CreateKeyPool = (
  signerContext,
  createMemorySignerArgs,
) => {
  const state: KeyPoolState = {
    poolKeys: undefined,
    poolKeysLoadingPromise: undefined,
  };

  const keyPoolContext = {
    getPoolKeys: createGetPoolKeys(
      state,
      signerContext,
      createMemorySignerArgs,
    ),
  };

  return {
    findKeyForTask: createFindKeyForTask(keyPoolContext),
    isKeyForTaskExist: createIsKeyForTaskExist(keyPoolContext),
  };
};
