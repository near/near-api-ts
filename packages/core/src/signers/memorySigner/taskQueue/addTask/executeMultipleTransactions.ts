export const createExecuteMultipleTransactions =
  (context: any) => async (params: any) => {
    const { transactionIntents, options } = params;
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
          result: await executeTransaction({ ...intent, options }),
        });
      } catch (error) {
        output.push({ status: 'Error', error });
        failed = true;
      }
    }
    // TODO consider trowing error with output

    return output;
  };
