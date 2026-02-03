import type {
  IsKeyForTaskExist,
  KeyPoolContext,
  PoolKeys,
} from 'nat-types/signers/memorySigner/keyPool';
import type {
  FullAccessKeyPriority,
  FunctionCallKeyPriority,
} from 'nat-types/signers/memorySigner/taskQueue';
import { result } from '@common/utils/result';
import { createNatError } from '@common/natError';

const isKeyExist = async (
  keyPriority: FullAccessKeyPriority | FunctionCallKeyPriority,
  poolKeys: PoolKeys,
) => {
  // If there exists at least 1 FA key - return true
  if (keyPriority.accessType === 'FullAccess')
    return poolKeys.fullAccess.length > 0;

  // If keyType is FunctionCall - find the key which follows all criteria
  return poolKeys.functionCall.some((key) => {
    const isContractIdMatch =
      key.contractAccountId === keyPriority.contractAccountId;

    // No allowedFunctions means that the key can call every contract function
    const isFnCallAllowed =
      key.allowedFunctions === undefined ||
      key.allowedFunctions.includes(keyPriority.calledFnName);

    return isContractIdMatch && isFnCallAllowed;
  });
};

export const createIsKeyForTaskExist =
  (keyPoolContext: KeyPoolContext): IsKeyForTaskExist =>
  async (task) => {
    const poolKeys = await keyPoolContext.getPoolKeys();
    if (!poolKeys.ok) return poolKeys;

    for (const keyPriority of task.accessTypePriority) {
      const isKey = await isKeyExist(keyPriority, poolKeys.value);
      if (isKey) return result.ok(true);
    }

    return result.err(
      createNatError({
        kind: 'MemorySigner.KeyPool.SigningKey.NotFound',
        context: {
          poolKeys: poolKeys.value,
          accessTypePriority: task.accessTypePriority,
        },
      }),
    );
  };
