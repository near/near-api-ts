export const createExecuteMultipleTransactions =
  (context: any) => async (args: any) => {
    const { transactionIntents } = args;
    const { executeTransaction } = context.signerContext.taskQueue;

    const output = [];
    let failed = false;

    // TODO check if all txns could be executed in the future (if keyPool has all needed keys)

    for (const intent of transactionIntents) {
      if (failed) {
        output.push({ status: 'Canceled' });
        continue;
      }
      try {
        output.push({
          status: 'Success',
          result: await executeTransaction({ ...intent }),
        });
      } catch (error) {
        output.push({ status: 'Error', error });
        failed = true;
      }
    }
    // TODO consider trowing error with output

    return output;
  };
