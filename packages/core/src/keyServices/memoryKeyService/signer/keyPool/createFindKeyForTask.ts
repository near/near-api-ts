export const createFindKeyForTask = (keyList: any) => (keyPriority: any) => {
  // TODO implement proper search + FA support
  if (keyPriority[0] === 'FullAccess') {
    return keyList.fullAccess.find((key: any) => !key.isLocked);
  }
  return null;
};
