import type { PoolKey } from '../../../types/signer/inner/keyPool';
import type {
  ContractFunctionCallKeyPriority,
  FindTaskForKey,
  FullAccessKeyPriority,
  TaskQueueContext,
} from '../../../types/signer/inner/taskQueue';

const checkIfKeyMatchRequirements = (
  keyPriority: FullAccessKeyPriority | ContractFunctionCallKeyPriority,
  key: PoolKey,
): boolean => {
  if (key.accessType !== keyPriority.accessType) return false;
  if (key.accessType === 'FullAccess') return true;

  // If keyType is ContractFunctionCall - find the key which follows all criteria
  const isContractIdMatch =
    key.contractAccountId === (keyPriority as ContractFunctionCallKeyPriority).contractAccountId;

  // No allowedFunctions means that the key can call every contract function
  const isFnCallAllowed =
    key.allowedFunctions === 'AllNonPayable' ||
    key.allowedFunctions.includes((keyPriority as ContractFunctionCallKeyPriority).calledFnName);

  return isContractIdMatch && isFnCallAllowed;
};

export const createFindTaskForKey =
  (context: TaskQueueContext): FindTaskForKey =>
  (key) =>
    context.queue.find((task) =>
      task.accessTypePriority.some((keyPriority) => checkIfKeyMatchRequirements(keyPriority, key)),
    );
