import type { CryptoHash } from '../common';
import type {
  BaseDeserializeTransactionResultDataFn,
  MaybeBaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionExecutionStepsFn,
  MaybeBaseDeserializeTransactionResultDataFn,
} from './deserializers';
import type {
  ConversionStepFailure,
  ConversionStepSuccess,
} from './processingSteps/conversionStep';
import type { ExecutionError } from './processingSteps/executionSteps/executionError';
import type { ExecutionSteps } from './processingSteps/executionSteps/executionStep';
import type { RefundStep } from './processingSteps/refundStep';

// result.data is a return type of custom deserializer (passed by user) or unknown;
export type TransactionSuccessResultData<RDF extends MaybeBaseDeserializeTransactionResultDataFn> = [
  RDF,
] extends [BaseDeserializeTransactionResultDataFn]
  ? ReturnType<RDF>
  : unknown;

export type TransactionSuccess<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn,
> = {
  transactionHash: CryptoHash;
  result: {
    status: 'Success';
    data: TransactionSuccessResultData<RDF>;
  };
  processingSteps: {
    conversionStep: ConversionStepSuccess<ASF>;
    executionSteps: ExecutionSteps<ESF>;
    refundSteps: RefundStep[];
  };
};

export type TransactionConversionFailure<
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn,
> = {
  transactionHash: CryptoHash;
  result: {
    status: 'ConversionError';
    error: unknown; // TODO figure out the real type
  };
  processingSteps: {
    conversionStep: ConversionStepFailure<ASF>;
    executionSteps: null;
    refundSteps: null;
  };
};

export type TransactionExecutionFailure<
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn,
> = {
  transactionHash: CryptoHash;
  result: {
    status: 'ExecutionError';
    error: ExecutionError;
  };
  processingSteps: {
    conversionStep: ConversionStepSuccess<ASF>;
    executionSteps: ExecutionSteps<ESF>;
    refundSteps: RefundStep[];
  };
};

export type TransactionResult<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> =
  | TransactionSuccess<RDF, ASF, ESF>
  | TransactionConversionFailure<ASF>
  | TransactionExecutionFailure<ASF, ESF>;
