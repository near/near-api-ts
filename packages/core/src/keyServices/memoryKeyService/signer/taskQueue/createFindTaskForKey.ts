const checkIfKeyMatchRequirements = (keyPriority: any, key: any) => {
  if (key.permission !== keyPriority.type) return false;
  if (keyPriority.type === 'FullAccess') return true;

  // If keyType is FunctionCall - find the key which follows all criteria
  const isContractIdMatch =
    key.contractAccountId === keyPriority.contractAccountId;

  // No allowedFunctions means that the key can call every contract function
  const isFnCallAllowed =
    key.allowedFunctions === undefined ||
    (Array.isArray(key.allowedFunctions) &&
      key.allowedFunctions.includes(keyPriority.calledFnName));

  // No gasBudget means unlimited gasBudget
  const hasEnoughGasBudget =
    key.gasBudget === undefined ||
    key.gasBudget.yoctoNear > keyPriority.requiredGasBudget.yoctoNear;

  return isContractIdMatch && isFnCallAllowed && hasEnoughGasBudget;
};

export const createFindTaskForKey = (state: any) => (key: any) =>
  state.queue.find((task: any) =>
    task.signingKeyPriority.some((keyPriority: any) =>
      checkIfKeyMatchRequirements(keyPriority, key),
    ),
  );
