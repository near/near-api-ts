import type { Base64String } from '../../../../../../../_common/common';
import type { RawExecutionStep } from '../executionStep';
import type { RawTransactionActionSummary } from './actionSummaries';
import type { ProtocolEra } from './protocolEra';

// DeserializeTransactionResultData
export type DeserializeTransactionResultDataArgs = { rawData: Base64String };

export type BaseDeserializeTransactionResultDataFn = (
  args: DeserializeTransactionResultDataArgs,
) => unknown;

export type MaybeBaseDeserializeTransactionResultDataFn =
  | BaseDeserializeTransactionResultDataFn
  | undefined;

// DeserializeTransactionActionSummaries
export type DeserializeTransactionActionSummariesArgs<PE extends ProtocolEra> = {
  rawActionSummaries: RawTransactionActionSummary<PE>[];
};

export type BaseDeserializeTransactionActionSummariesFn<PE extends ProtocolEra> = (
  args: DeserializeTransactionActionSummariesArgs<PE>,
) => unknown;

export type MaybeBaseDeserializeTransactionActionSummariesFn<PE extends ProtocolEra> =
  | BaseDeserializeTransactionActionSummariesFn<PE>
  | undefined;

// DeserializeTransactionExecutionSteps
export type DeserializeTransactionExecutionStepsArgs<PE extends ProtocolEra> = {
  rawExecutionSteps: RawExecutionStep<PE>[];
};

export type BaseDeserializeTransactionExecutionStepsFn<PE extends ProtocolEra> = (
  args: DeserializeTransactionExecutionStepsArgs<PE>,
) => unknown;

export type MaybeBaseDeserializeTransactionExecutionStepsFn<PE extends ProtocolEra> =
  | BaseDeserializeTransactionExecutionStepsFn<PE>
  | undefined;
