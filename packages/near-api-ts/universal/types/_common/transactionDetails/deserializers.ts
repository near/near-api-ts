import type { Base64String } from '../common';
import type { RawActionSummary } from './actionSummaries';
import type { RawExecutionStep } from './processingSteps/executionSteps/executionStep';

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
