const findSigningKey = (keyPriority: any, keyList: any) => {
  if (keyPriority.type === 'FullAccess') {
    return keyList.fullAccess.find((key: any) => !key.isLocked);
  }

  // If keyType is FunctionCall - find the key which follows all criteria
  return keyList.functionCall.find((key: any) => {
    const isUnlocked = key.isLocked === false;

    const isContractIdMatch =
      key.contractAccountId === keyPriority.contractAccountId;

    // No allowedFunctions means that the key can call every contract function
    const isFnCallAllowed =
      key.allowedFunctions === undefined ||
      (Array.isArray(key.allowedFunctions) &&
        key.allowedFunctions.includes(keyPriority.calledFnName));

    return isUnlocked && isContractIdMatch && isFnCallAllowed;
  });
};

export const createFindKeyForTask = (keyList: any) => (task: any) => {
  for (const keyPriority of task.signingKeyPriority) {
    const key = findSigningKey(keyPriority, keyList);
    if (key) return key;
  }
};
