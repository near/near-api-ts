const isKeyExist = (keyPriority: any, keyList: any) => {
  // If exists at least 1 FA key - return true
  if (keyPriority.type === 'FullAccess') return keyList.fullAccess.length > 0;

  // If keyType is FunctionCall - find the key which follows all criteria
  return keyList.functionCall.find((key: any) => {
    const isContractIdMatch =
      key.contractAccountId === keyPriority.contractAccountId;

    // No allowedFunctions means that the key can call every contract function
    const isFnCallAllowed =
      key.allowedFunctions === undefined ||
      key.allowedFunctions.includes(keyPriority.calledFnName);

    return isContractIdMatch && isFnCallAllowed;
  });
};

export const createIsKeyForTaskExist = (keyList: any) => (task: any) =>
  task.signingKeyPriority.some((keyPriority: any) =>
    isKeyExist(keyPriority, keyList),
  );
