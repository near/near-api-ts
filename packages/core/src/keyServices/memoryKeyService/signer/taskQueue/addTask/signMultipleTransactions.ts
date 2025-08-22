// import type { TransactionIntent } from 'nat-types/transaction';
// import { getSignKeyPriority } from './helpers/getSignKeyPriority';
//
// export const signMultipleTransactions =
//   (signerContext: any, state: any) =>
//   async (transactionIntent: TransactionIntent) => {
//     const task = {
//       type: 'SignTransaction',
//       taskId: crypto.randomUUID(),
//       keyPriority: getSignKeyPriority(transactionIntent),
//       transactionIntent,
//     };
//
//     state.queue.push(task);
//
//     queueMicrotask(() => {
//       signerContext.matcher.handleAddTask(task);
//     });
//
//     return signerContext.resolver.waitForTask(task.taskId);
//   };
