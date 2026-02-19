import type { FindKeyForTask, KeyPoolContext, PoolKeys } from '@universal/types/signers/memorySigner/inner/keyPool';
import type { FullAccessKeyPriority, FunctionCallKeyPriority } from '@universal/types/signers/memorySigner/inner/taskQueue';
import { result } from '../../../_common/utils/result';

const findSigningKey = (
  keyPriority: FullAccessKeyPriority | FunctionCallKeyPriority,
  poolKeys: PoolKeys,
) => {
  if (keyPriority.accessType === 'FullAccess')
    return poolKeys.fullAccess.find((key) => !key.isLocked);

  // If keyType is FunctionCall - find the key which follows all criteria
  return poolKeys.functionCall.find((key) => {
    const isContractIdMatch =
      key.contractAccountId === keyPriority.contractAccountId;

    // No allowedFunctions means that the key can call every contract function
    const isFnCallAllowed =
      key.allowedFunctions === undefined ||
      key.allowedFunctions.includes(keyPriority.calledFnName);

    return !key.isLocked && isContractIdMatch && isFnCallAllowed;
  });
};

export const createFindKeyForTask =
  (keyPoolContext: KeyPoolContext): FindKeyForTask =>
  async (task) => {
    const poolKeys = await keyPoolContext.getPoolKeys();
    if (!poolKeys.ok) return poolKeys;

    for (const keyPriority of task.accessTypePriority) {
      const key = findSigningKey(keyPriority, poolKeys.value);

      if (key) {
        // We need to lock the key to prevent it from being used by other tasks
        // We need to do it synchronously here to avoid race conditions;
        key.lock();
        return result.ok(key);
      }
    }

    return result.ok(undefined);
  };
