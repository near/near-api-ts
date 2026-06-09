import type { Base64String, CryptoHash } from '../common';
import type { ConversionStepError, ConversionStepSuccess } from './processingSteps/conversionStep';
import type { ExecutionSteps } from './processingSteps/executionStep';
import type { RefundStep } from './processingSteps/refundStep';

export type DeserializeTransactionResultDataArgs = { data: Base64String };

export type BaseDeserializeTransactionResultDataFn = (
  args: DeserializeTransactionResultDataArgs,
) => unknown;

export type MaybeBaseDeserializeTransactionResultDataFn =
  | BaseDeserializeTransactionResultDataFn
  | undefined;

// Data type is a return type of custom deserializer (passed by user) or unknown;
type TransactionSuccessResultData<RD extends MaybeBaseDeserializeTransactionResultDataFn> = [
  RD,
] extends [BaseDeserializeTransactionResultDataFn]
  ? ReturnType<RD>
  : unknown;

export type TransactionSuccess<RD extends MaybeBaseDeserializeTransactionResultDataFn> = {
  transactionHash: CryptoHash;
  result: {
    status: 'Success';
    data: TransactionSuccessResultData<RD>;
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

export type TransactionResult<RD extends MaybeBaseDeserializeTransactionResultDataFn = undefined> =
  | TransactionSuccess<RD>
  | TransactionConversionError
  | TransactionExecutionError;
