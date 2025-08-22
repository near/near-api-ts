import { createFindTaskForKey } from './createFindTaskForKey';
import { signTransaction } from './addTask/signTransaction';
import { executeTransaction } from './addTask/executeTransaction';

export const createTaskQueue = (signerContext: any) => {
  const state = {
    queue: [],
  };

  const removeTask = (taskId: any) => {
    state.queue = state.queue.filter((task: any) => task.taskId !== taskId);
  };

  return {
    addTask: {
      signTransaction: signTransaction(signerContext, state),
      executeTransaction: executeTransaction(signerContext, state),
    },
    findTaskForKey: createFindTaskForKey(state),
    removeTask,
  };
};
