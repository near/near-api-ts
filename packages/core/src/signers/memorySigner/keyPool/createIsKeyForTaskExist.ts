import type { IsKeyForTaskExist, KeyList } from 'nat-types/signers/keyPool';
import type {
  FullAccessKeyPriority,
  FunctionCallKeyPriority,
} from 'nat-types/signers/taskQueue';

const isKeyExist = (
  keyPriority: FullAccessKeyPriority | FunctionCallKeyPriority,
  keyList: KeyList,
) => {
  // If exists at least 1 FA key - return true
  if (keyPriority.accessType === 'FullAccess') return keyList.fullAccess.length > 0;

  // If keyType is FunctionCall - find the key which follows all criteria
  return keyList.functionCall.find((key) => {
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
  (keyList: KeyList): IsKeyForTaskExist =>
  (task) =>
    task.signingKeyPriority.some((keyPriority) =>
      isKeyExist(keyPriority, keyList),
    );
