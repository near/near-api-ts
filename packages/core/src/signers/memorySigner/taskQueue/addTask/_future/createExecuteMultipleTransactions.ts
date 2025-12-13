// import type {
//   ExecuteMultipleTransactions,
//   TaskQueueContext,
// } from 'nat-types/signers/memorySigner/taskQueue';
//
// export const createExecuteMultipleTransactions =
//   (context: TaskQueueContext): ExecuteMultipleTransactions =>
//   async (args) => {
//     const { transactionIntents } = args;
//     const { executeTransaction } = context.signerContext.taskQueue;
//
//     const output = [];
//     let failed = false;
//
//     // TODO check if all txns could be executed in the future (if keyPool has all needed keys)
//
//     for (const intent of transactionIntents) {
//       if (failed) {
//         output.push({ status: 'Canceled' as const });
//         continue;
//       }
//       try {
//         output.push({
//           status: 'Success' as const,
//           result: await executeTransaction({ ...intent }),
//         });
//       } catch (error) {
//         output.push({
//           status: 'Error' as const,
//           error,
//         });
//         failed = true;
//       }
//     }
//     // TODO consider trowing error with output
//
//     return output;
//   };
