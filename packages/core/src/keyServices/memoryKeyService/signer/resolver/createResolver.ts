export const createResolver = () => {
  const activeTasks: any = {};

  const waitForTask = (taskId: any) =>
    new Promise((resolve, reject) => {
      console.log('waitForTask', taskId);
      activeTasks[taskId] = ({ result, error }: any) => {
        console.log('completeTask', taskId);
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
