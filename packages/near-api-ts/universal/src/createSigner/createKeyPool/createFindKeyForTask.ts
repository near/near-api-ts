import type { FindKeyForTask, KeyPoolContext, PoolKeys } from '../../../types/signer/inner/keyPool';
import type {
  ContractFunctionCallKeyPriority,
  FullAccessKeyPriority,
} from '../../../types/signer/inner/taskQueue';
import { result } from '../../_common/_common/_common/result';

const findSigningKey = (
  keyPriority: FullAccessKeyPriority | ContractFunctionCallKeyPriority,
  poolKeys: PoolKeys,
) => {
  if (keyPriority.accessType === 'FullAccess')
    return poolKeys.fullAccess.find((key) => !key.isLocked);

  // If keyType is ContractFunctionCall - find the key which follows all criteria
  return poolKeys.contractFunctionCall.find((key) => {
    const isContractIdMatch = key.contractAccountId === keyPriority.contractAccountId;

    // No allowedFunctions means that the key can call every contract function
    const isFnCallAllowed =
      key.allowedFunctions === 'AllNonPayable' ||
      key.allowedFunctions.includes(keyPriority.calledFnName);

    return !key.isLocked && isContractIdMatch && isFnCallAllowed;
  });
};

export const createFindKeyForTask =
  (keyPoolContext: KeyPoolContext): FindKeyForTask =>
  async (task) => {
    const poolKeys = await keyPoolContext.getPoolKeys();
    if (!poolKeys.success) return poolKeys;

    for (const keyPriority of task.accessTypePriority) {
      const key = findSigningKey(keyPriority, poolKeys.data);

      if (key) {
        // We need to lock the key to prevent it from being used by other tasks
        // We need to do it synchronously here to avoid race conditions;
        key.lock();
        return result.ok(key);
      }
    }

    return result.ok(undefined);
  };
