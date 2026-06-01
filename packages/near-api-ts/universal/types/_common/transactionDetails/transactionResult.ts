import type { CryptoHash } from '../common';
import type { ConversionStepError, ConversionStepSuccess } from './processingSteps/conversionStep';
import type { ExecutionSteps } from './processingSteps/executionStep';
import type { RefundStep } from './processingSteps/refundStep';

export type TransactionSuccess = {
  transactionHash: CryptoHash;
  result: {
    status: 'Success';
    data: unknown;
  };
  processingSteps: {
    conversionStep: ConversionStepSuccess;
    executionSteps: ExecutionSteps;
    refundSteps: RefundStep[];
  };
};

export type TransactionConversionError = {
  transactionHash: CryptoHash;
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

export type TransactionExecutionError = {
  transactionHash: CryptoHash;
  result: {
    status: 'ExecutionError';
    error: { kind: unknown; context: unknown };
  };
  processingSteps: {
    conversionStep: ConversionStepSuccess;
    executionSteps: ExecutionSteps;
    refundSteps: RefundStep[];
  };
};

export type TransactionResult =
  | TransactionSuccess
  | TransactionConversionError
  | TransactionExecutionError;
