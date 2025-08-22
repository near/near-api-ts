export const createResolver = () => {
  const activeTasks: any = {};

  const waitForTask = (taskId: any) =>
    new Promise((resolve, reject) => {
      activeTasks[taskId] = ({ result, error }: any) => {
        result ? resolve(result) : reject(error);
        delete activeTasks[taskId];
      };
    });

  const completeTask = (taskId: any, data: any) => {
    activeTasks[taskId](data);
  };

  return {
    waitForTask,
    completeTask,
  };
};
