import { createFindTaskForKey } from './createFindTaskForKey';
import { createAddSignTransactionTask } from './createAddSignTransactionTask';

export const createTaskQueue = (signerContext: any) => {
  const state = {
    queue: [],
  };

  const removeTask = (taskId: any) => {
    state.queue = state.queue.filter((task: any) => task.taskId !== taskId);
  };

  return {
    addSignTransactionTask: createAddSignTransactionTask(signerContext, state),
    findTaskForKey: createFindTaskForKey(signerContext, state),
    removeTask,
  };
};
