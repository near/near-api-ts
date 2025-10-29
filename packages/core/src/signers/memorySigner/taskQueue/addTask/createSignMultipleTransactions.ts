import type {
  SignMultipleTransactions,
  TaskQueueContext,
} from 'nat-types/signers/memorySigner/taskQueue';

export const createSignMultipleTransactions =
  (context: TaskQueueContext): SignMultipleTransactions =>
  async (args) => {
    const { transactionIntents } = args;
    const { signTransaction } = context.signerContext.taskQueue;

    const output = [];
    let failed = false;

    for (const intent of transactionIntents) {
      if (failed) {
        output.push({ status: 'Canceled' as const });
        continue;
      }
      try {
        output.push({
          status: 'Success' as const,
          result: await signTransaction(intent),
        });
      } catch (error) {
        output.push({
          status: 'Error' as const,
          error,
        });
        failed = true;
      }
    }

    return output;
  };
