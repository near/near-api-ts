import { createFindKeyForTask } from './createFindKeyForTask';
import { createIsKeyForTaskExist } from './createIsKeyForTaskExist';
import type {
  CreateKeyPool,
  KeyPoolState,
} from '../../../../types/signers/memorySigner/inner/keyPool';
import { createGetPoolKeys } from './createGetPoolKeys/createGetPoolKeys';

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
