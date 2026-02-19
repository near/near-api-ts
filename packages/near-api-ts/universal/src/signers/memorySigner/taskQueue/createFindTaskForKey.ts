import type { PoolKey } from '@universal/types/signers/memorySigner/inner/keyPool';
import type { FindTaskForKey, FullAccessKeyPriority, FunctionCallKeyPriority, TaskQueueContext } from '@universal/types/signers/memorySigner/inner/taskQueue';

const checkIfKeyMatchRequirements = (
  keyPriority: FullAccessKeyPriority | FunctionCallKeyPriority,
  key: PoolKey,
): boolean => {
  if (key.accessType !== keyPriority.accessType) return false;
  if (key.accessType === 'FullAccess') return true;

  // If keyType is FunctionCall - find the key which follows all criteria
  const isContractIdMatch =
    key.contractAccountId ===
    (keyPriority as FunctionCallKeyPriority).contractAccountId;

  // No allowedFunctions means that the key can call every contract function
  const isFnCallAllowed =
    key.allowedFunctions === undefined ||
    key.allowedFunctions.includes(
      (keyPriority as FunctionCallKeyPriority).calledFnName,
    );

  return isContractIdMatch && isFnCallAllowed;
};

export const createFindTaskForKey =
  (context: TaskQueueContext): FindTaskForKey =>
  (key) =>
    context.queue.find((task) =>
      task.accessTypePriority.some((keyPriority) =>
        checkIfKeyMatchRequirements(keyPriority, key),
      ),
    );
