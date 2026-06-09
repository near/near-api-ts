import type { ActionView } from '@near-js/jsonrpc-types';
import type { Base64String, CryptoHash } from '../common';
import type { ConversionStepError, ConversionStepSuccess } from './processingSteps/conversionStep';
import type { ExecutionSteps } from './processingSteps/executionStep';
import type { RefundStep } from './processingSteps/refundStep';

// DeserializeTransactionResultData
export type DeserializeTransactionResultDataArgs = { data: Base64String };

export type BaseDeserializeTransactionResultDataFn = (
  args: DeserializeTransactionResultDataArgs,
) => unknown;

export type MaybeBaseDeserializeTransactionResultDataFn =
  | BaseDeserializeTransactionResultDataFn
  | undefined;

// DeserializeTransactionActionSummaries
export type DeserializeTransactionActionSummariesArgs = { rawActionSummaries: ActionView[] };

export type BaseDeserializeTransactionActionSummariesFn = (
  args: DeserializeTransactionActionSummariesArgs,
) => unknown; // ActionSummary[]

export type MaybeBaseDeserializeTransactionActionSummariesFn =
  | BaseDeserializeTransactionActionSummariesFn
  | undefined;

// Data type is a return type of custom deserializer (passed by user) or unknown;
type TransactionSuccessResultData<RD extends MaybeBaseDeserializeTransactionResultDataFn> = [
  RD,
] extends [BaseDeserializeTransactionResultDataFn]
  ? ReturnType<RD>
  : unknown;

export type TransactionSuccess<
  RD extends MaybeBaseDeserializeTransactionResultDataFn,
  AS extends MaybeBaseDeserializeTransactionActionSummariesFn,
> = {
  transactionHash: CryptoHash;
  result: {
    status: 'Success';
    data: TransactionSuccessResultData<RD>;
  };
  processingSteps: {
    conversionStep: ConversionStepSuccess<AS>;
    executionSteps: ExecutionSteps;
    refundSteps: RefundStep[];
  };
};

export type TransactionConversionError<
  AS extends MaybeBaseDeserializeTransactionActionSummariesFn,
> = {
  transactionHash: CryptoHash;
  result: {
    status: 'ConversionError';
    error: { kind: unknown; context: unknown };
  };
  processingSteps: {
    conversionStep: ConversionStepError<AS>;
    executionSteps: null;
    refundSteps: null;
  };
};

export type TransactionExecutionError<AS extends MaybeBaseDeserializeTransactionActionSummariesFn> =
  {
    transactionHash: CryptoHash;
    result: {
      status: 'ExecutionError';
      error: { kind: unknown; context: unknown };
    };
    processingSteps: {
      conversionStep: ConversionStepSuccess<AS>;
      executionSteps: ExecutionSteps;
      refundSteps: RefundStep[];
    };
  };

export type TransactionResult<
  RD extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  AS extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
> = TransactionSuccess<RD, AS> | TransactionConversionError<AS> | TransactionExecutionError<AS>;
