// return generic error - will repack later
/*
NatError({
  kind: 'Client.SendSignedTransaction.Rpc.Action.CreateAccount.AlreadyExists',
  context: {
    signedTransactionBorsh64,
    transactionDetails: { // `TransactionExecutionFailure` but without `refundSteps` and `status`
      processingStage: 'ExecutedOptimistic',
      error: {
        kind: 'Action.CreateAccount.AlreadyExists',
        context: {
          newAccountId: 'abc'
        }
      },
      processingSteps: {
        conversationStep: {...},
        executionSteps: [...]
      }
    }
  }
})

 */
export const getExecutionError = () => {

}
