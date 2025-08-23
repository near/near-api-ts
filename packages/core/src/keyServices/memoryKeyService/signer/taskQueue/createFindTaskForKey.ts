const checkIfKeyMatchRequirements = (keyPriority: any, key: any) => {
  if (key.type !== keyPriority.type) return false;
  if (key.type === 'FullAccess') return true;

  // If keyType is FunctionCall - find the key which follows all criteria
  const isContractIdMatch =
    key.contractAccountId === keyPriority.contractAccountId;

  // No allowedFunctions means that the key can call every contract function
  const isFnCallAllowed =
    key.allowedFunctions === undefined ||
    key.allowedFunctions.includes(keyPriority.calledFnName);

  return isContractIdMatch && isFnCallAllowed;
};

export const createFindTaskForKey = (state: any) => (key: any) =>
  state.queue.find((task: any) =>
    task.signingKeyPriority.some((keyPriority: any) =>
      checkIfKeyMatchRequirements(keyPriority, key),
    ),
  );
