import type {
  FindTaskForKey,
  FullAccessKeyPriority,
  FunctionCallKeyPriority,
  TaskQueueContext,
} from 'nat-types/signers/taskQueue';
import type { KeyPoolKey } from 'nat-types/signers/keyPool';

const checkIfKeyMatchRequirements = (
  keyPriority: FullAccessKeyPriority | FunctionCallKeyPriority,
  key: KeyPoolKey,
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
      task.signingKeyPriority.some((keyPriority) =>
        checkIfKeyMatchRequirements(keyPriority, key),
      ),
    );
