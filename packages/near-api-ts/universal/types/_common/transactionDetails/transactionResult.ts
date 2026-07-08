import type { Base64String, CryptoHash } from '../common';
import type { RawActionSummary } from './actionSummaries';
import type {
  ConversionStepFailure,
  ConversionStepSuccess,
} from './processingSteps/conversionStep';
import type { ExecutionError } from './processingSteps/executionSteps/executionError';
import type {
  ExecutionSteps,
  RawExecutionStep,
} from './processingSteps/executionSteps/executionStep';
import type { RefundStep } from './processingSteps/refundStep';

// DeserializeTransactionResultData
export type DeserializeTransactionResultDataArgs = { rawData: Base64String };

export type BaseDeserializeTransactionResultDataFn = (
  args: DeserializeTransactionResultDataArgs,
) => unknown;

export type MaybeBaseDeserializeTransactionResultDataFn =
  | BaseDeserializeTransactionResultDataFn
  | undefined;

// DeserializeTransactionActionSummaries
export type DeserializeTransactionActionSummariesArgs = { rawActionSummaries: RawActionSummary[] };

export type BaseDeserializeTransactionActionSummariesFn = (
  args: DeserializeTransactionActionSummariesArgs,
) => unknown;

export type MaybeBaseDeserializeTransactionActionSummariesFn =
  | BaseDeserializeTransactionActionSummariesFn
  | undefined;

// DeserializeTransactionExecutionSteps
export type DeserializeTransactionExecutionStepsArgs = { rawExecutionSteps: RawExecutionStep[] };

export type BaseDeserializeTransactionExecutionStepsFn = (
  args: DeserializeTransactionExecutionStepsArgs,
) => unknown;

export type MaybeBaseDeserializeTransactionExecutionStepsFn =
  | BaseDeserializeTransactionExecutionStepsFn
  | undefined;

// Data type is a return type of custom deserializer (passed by user) or unknown;
type TransactionSuccessResultData<RDF extends MaybeBaseDeserializeTransactionResultDataFn> = [
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
