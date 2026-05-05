import type { Prettify } from '../../utils';
import type { AccountId, CryptoHash, Nonce } from '../common';
import type { PublicKey, Signature } from '../crypto';

// export type TransactionProcessingStage =
//   | 'StartedOptimistic'
//   | 'StartedFinal'
//   | 'ExecutedOptimistic'
//   | 'ExecutedNearlyFinal'
//   | 'ExecutedFinal';
//
// export type TransactionExecutionStatus = 'InProgress' | 'Success' | 'Error';

type StartedTransactionDetails = {
  transactionHash: CryptoHash;
  processingStage: 'StartedOptimistic' | 'StartedFinal';
};

type ExecutionSuccess = {
  status: 'Success';
  data: unknown;
};

type ExecutionError = {
  status: 'Error';
  error: unknown;
};

type TransactionBaseDetails = {
  transactionHash: CryptoHash;
  execution: ExecutionSuccess | ExecutionError; // outcome?
  signerAccountId: AccountId;
  signerPublicKey: PublicKey;
  nonce: Nonce;
  actionOverviews: unknown[],
  receiverAccountId: AccountId;
  signature: Signature;
};

type TransactionToReceiptConversionStep = unknown;

type ExecutionStep = {
  receiptId: CryptoHash;
};

type ExecutionTrace = [TransactionToReceiptConversionStep, ...ExecutionStep[]];

export type ExecutedTransactionDetails = Prettify<
  {
    processingStage: 'ExecutedOptimistic' | 'ExecutedNearlyFinal' | 'ExecutedFinal';
    executionTrace: ExecutionTrace,
    // receipts: Receipts;
  } & TransactionBaseDetails
>;

type TransactionDetails = StartedTransactionDetails | ExecutedTransactionDetails;
