import type { AccountId, CryptoHash, TransactionNonce } from '../common';
import type { PublicKey, Signature } from '../crypto';
import type { ActionSummaries } from './actionSummaries';
import type { ProcessingStage } from './processingStage';
import type { ConversionStepError, ConversionStepSuccess } from './processingSteps/conversionStep';
import type { ExecutionStep } from './processingSteps/executionStep';
import type { RefundStep } from './processingSteps/refundStep';

export type TransactionResultCommon = {
  transactionHash: CryptoHash;
  processingStage: ProcessingStage['CompletedFinal'];
  transactionSummary: {
    signerAccountId: AccountId;
    signerPublicKey: PublicKey;
    actionSummaries: ActionSummaries;
    receiverAccountId: AccountId;
    nonce: TransactionNonce;
    signature: Signature;
  };
};

export type TransactionSuccess = TransactionResultCommon & {
  result: {
    status: 'Success';
    data: unknown;
  };
  processingSteps: {
    conversionStep: ConversionStepSuccess;
    executionSteps: ExecutionStep[];
    refundSteps: RefundStep[];
  };
};

export type TransactionConversionError = TransactionResultCommon & {
  result: {
    status: 'ConversionError';
    error: { kind: unknown; context: unknown };
  };
  processingSteps: {
    conversionStep: ConversionStepError;
    executionSteps: null;
    refundSteps: null;
  };
};

export type TransactionExecutionError = TransactionResultCommon & {
  result: {
    status: 'ExecutionError';
    error: { kind: unknown; context: unknown };
  };
  processingSteps: {
    conversionStep: ConversionStepSuccess;
    executionSteps: ExecutionStep[];
    refundSteps: RefundStep[];
  };
};

export type TransactionResult =
  | TransactionSuccess
  | TransactionConversionError
  | TransactionExecutionError;
