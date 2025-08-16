export const createFindTaskForKey =
  (signerContext: any, state: any) => (key: any) => {
    return state.queue.find((task: any) => {
      // TODO implement FA and proper search
      return task.keyPriority[0] === key.permission;
    });
  };
