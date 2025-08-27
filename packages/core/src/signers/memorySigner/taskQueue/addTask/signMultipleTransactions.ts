export const createSignMultipleTransactions =
  (context: any) => async (params: any) => {
    const { transactionIntents } = params;
    const { signTransaction } = context.signerContext.taskQueue;

    const output = [];
    let failed = false;

    for (const intent of transactionIntents) {
      if (failed) {
        output.push({ status: 'Canceled' });
        continue;
      }
      try {
        output.push({
          status: 'Success',
          result: await signTransaction(intent),
        });
      } catch (error) {
        output.push({ status: 'Error', error });
        failed = true;
      }
    }

    return output;
  };
