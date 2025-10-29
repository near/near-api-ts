import type { FindKeyForTask, KeyList } from 'nat-types/signers/memorySigner/keyPool';
import type {
  FullAccessKeyPriority,
  FunctionCallKeyPriority,
} from 'nat-types/signers/memorySigner/taskQueue';

const findSigningKey = (
  keyPriority: FullAccessKeyPriority | FunctionCallKeyPriority,
  keyList: KeyList,
) => {
  if (keyPriority.accessType === 'FullAccess')
    return keyList.fullAccess.find((key) => !key.isLocked);

  // If keyType is FunctionCall - find the key which follows all criteria
  return keyList.functionCall.find((key) => {
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
  (keyList: KeyList): FindKeyForTask =>
  (task) => {
    for (const keyPriority of task.signingKeyPriority) {
      const key = findSigningKey(keyPriority, keyList);
      if (key) return key;
    }
  };
