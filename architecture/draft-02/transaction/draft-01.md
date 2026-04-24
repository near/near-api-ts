### Work draft
```typescript
// ConfirmationLevel - not really
// ProcessingStage
// LifecycleStage


// What can we guarantee for a user?
// type TransactionProcessingStage =
//   'IncludedOptimistic'        // IncludedOptimistic + Not Executed + No Refund
//   'IncludedFinal';            // IncludedFinal + Not Executed + No Refund
//  
//   'ExecutedOptimistic';       // IncludedOptimistic + ExecutedOptimistic + Maybe RefundOptimistic
//   'ExecutedPartiallyFinal';   // IncludedFinal + ExecutedOptimistic + Maybe RefundOptimistic
//  
//   'CompletedFinal';           // IncludedFinal + ExecutedFinal + RefundFinal

type TransactionProcessingStage =
  'StartedOptimistic'
  'StartedFinal' | 'ExecutedOptimistic'
  'ExecutedNearlyFinal'
  'ExecutedFinal'


type ExecutionStatus =
  'InProgress'
  'Success';
  'Error';


// ************************************************
/**
 * Assumptions:
 * In most cases, when a user want to get info about transaction, he wants to
 * get data about completed transaction, not about ongoing one;
 */

// All possible options: [no_wait | wait]; [null <-> ExecutedFinal]; [by hash | by signed_tx]; [with | without receipts]

client.getTransactionResult; // no_wait, [null, ExecutedFinal], by hash, with receipts
client.awaitTransactionResult; // wait, [ExecutedOptimistic, ExecutedFinal], by hash, with receipts


// client.getExecutedTransaction;
// client.getExecutedTransactionExecutionResult;
// client.getCompletedTransaction;
// // Or
// client.findTransaction; // Method #1
// client.getTransaction; // Method #2
//
// client.getTransaction({
//   transactionHash: '6BsVCdF4h8sgcY2mgoJ3ZUQ5M1nUMT5Nx3bXEtQAUVC8',
//   signerAccountId: 'alice.near', // senderId is a wrong name
//   minimalProcessingStage: 'IncludedFinal',
//   includeReceipts: false
// });


// ************************************************
/**
 * Assumptions:
 * In most cases, a user will not need to send a transaction directly by client.
 * He will use a signer to send a transaction. So we can have only 2 methods.
 */
client.fireSignedTransaction(); // None
client.sendSignedTransaction(); // StartedOptimistic <-> ExecutedFinal


// ************************************************
/**
 *  * Assumptions:
 * FunctionCall - the most often type of the transaction;
 *
 * In most cases, when a user want to perform a transaction, he wants to
 * send a function call and make sure that logically, this tx is correct.
 * He doesn't care about a rare case when the block may be dropped.
 * In some cases (50/50) he also want to get a return data from the contract function;
 */


signer.fireTransaction(); // None
signer.submitTransaction(); // StartedOptimistic <-> StartedFinal
signer.executeTransaction(); // ExecutedOptimistic <-> ExecutedFinal

// // Or (looks like not a good idea)
// signer.executeTransaction(); // ExecutedOptimistic / ExecutedPartiallyFinal
// signer.completeTransaction(); // CompletedFinal


// ************************************************


type TransactionResult = {
  transactionHash: 'FaeKovQ3iWsMQex6vwSH9eYbGnm2Y95DCaEgHdmkCM82',
  confirmationLevel: 'CompletedFinal',
  executionResult: {
    status: 'Success',
    data: 'bnVsbA=='
  },
  transactionArgs: { // ???? or flattened?
    signerAccountId: 'alice.near',
    signerPublicKey: 'ed25519:5BGSaf6YjVm756...RJSGjREvU9d',
    nonce: 2,
    actionRecords: [],
    receiverAccountId: 'bob.near',
  },
  signature: 'ed25519:5BGSaf6Yj...pRJSGjREvU9d',
  receipts: [{
    receiptId: 'FaeKovQ3iWsMQex6vwSH9eYbGnm2Y95DCaEgHdmkCM82',
    outcome: {
      executorAccountId: 'alice.near',
      status: 'Success'
      // status: {
      //   SuccessReceiptId: '7TVhDcQizyJJKYXdAGnQ9BJjwZ1hQ278ENEVVFoxzdi8'
      // },
      executedAt: { blockHash: '9Ri3aJasZSSjMZ3doCkHnyeqoJk31bbqhj41fMvhkiqR' },
      logs: null,
      metadata: { gasProfile: null, version: 1 },
      childReceiptIds: ['7TVhDcQizyJJKYXdAGnQ9BJjwZ1hQ278ENEVVFoxzdi8'],
      gasBurnt: { teraGas: '15.2' },
      tokensBurnt: { near: '0.00155' }
    },
    proof: null,
  }]
}

```

### Not likely

```typescript
// This field not only about execution but also about confirmation/finality
type TxExecutionStatus =
  'Included'
  'IncludedFinal'
  'ExecutedOptimistic'
  'Executed'
  'Final'
  
// Final of what? It's about finality or a final receipt outcome or?
type TransactionFinalExecutionStatus =
  'Started'
  'Failure'
  'SuccessValue'

// Why client can executeTransaction? Why client need 3 methods?
client.fireTransaction();
client.submitTransaction();
client.executeTransaction();

// Why they exist? What is the real difference?
client.getSubmittedTransaction({ minConfirmationLevel: 'IncludedFinal' }); // IncludedFinal <-> ExecutedFinal
client.getExecutedTransaction({ minConfirmationLevel: 'Executed' }); // ExecutedOptimistic <-> ExecutedFinal
```
