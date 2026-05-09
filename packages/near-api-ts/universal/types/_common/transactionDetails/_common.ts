/**
 * Native analog - Included
 */
export type StartedOptimistic = 'StartedOptimistic';

/**
 * Native analog - IncludedFinal
 */
export type StartedFinal = 'StartedFinal';

/**
 * Native analog - ExecutedOptimistic
 */
export type ExecutedOptimistic = 'ExecutedOptimistic';

/**
 * Native analog - Executed
 */
export type ExecutedNearlyFinal = 'ExecutedNearlyFinal';

/**
 * Native analog - Final
 */
export type ExecutedFinal = 'ExecutedFinal';

// export type TransactionProcessingStage =
//   | StartedOptimistic
//   | StartedFinal
//   | ExecutedOptimistic
//   | ExecutedNearlyFinal
//   | ExecutedFinal;

//
// export type TransactionExecutionStatus = 'InProgress' | 'Success' | 'Error';

// type StartedTransactionDetails = {
//   transactionHash: CryptoHash;
//   processingStage: StartedOptimistic | StartedFinal;
// };
//
// type TransactionBaseDetails = {
//   transactionHash: CryptoHash;
//   executionOutcome: ExecutionOutcome;
//   signerAccountId: AccountId;
//   signerPublicKey: PublicKey;
//   nonce: TransactionNonce;
//   actionSummaries: ActionSummaries;
//   receiverAccountId: AccountId;
//   signature: Signature;
// };

// export type ExecutedTransactionDetails = Prettify<
//   {
//     processingStage: 'ExecutedOptimistic' | 'ExecutedNearlyFinal' | 'ExecutedFinal';
//     executionTrace: ExecutionTrace;
//   } & TransactionBaseDetails
// >;

// type TransactionDetails = StartedTransactionDetails | ExecutedTransactionDetails;
