import type { Result } from '../../../../_common/common';
import type { ClientContext } from '../../../client';
import type { MaybeTransactionProcessingStage } from '../_common/transactionDetails/_common/processingStage';
import type {
  MaybeDeserializeActionSummariesFn,
  MaybeDeserializeExecutionStepsFn,
  MaybeDeserializeResultDataFn,
  SendSignedTransactionArgs,
} from './args';
import type { SendSignedTransactionError } from './error';
import type { SendSignedTransactionOutput } from './output';

// The deserializer type params default to `MaybeDeserialize…Fn`, not `undefined`: TS checks a call
// against the defaults before it types an inline deserializer, and `undefined` poisons its key.
export type SafeSendSignedTransaction = <
  TPS extends MaybeTransactionProcessingStage = undefined,
  RDF extends MaybeDeserializeResultDataFn = MaybeDeserializeResultDataFn,
  ASF extends MaybeDeserializeActionSummariesFn = MaybeDeserializeActionSummariesFn,
  ESF extends MaybeDeserializeExecutionStepsFn = MaybeDeserializeExecutionStepsFn,
>(
  args: SendSignedTransactionArgs<TPS, RDF, ASF, ESF>,
) => Promise<
  Result<SendSignedTransactionOutput<TPS, RDF, ASF, ESF>, SendSignedTransactionError<TPS, ASF, ESF>>
>;

export type SendSignedTransaction = <
  TPS extends MaybeTransactionProcessingStage = undefined,
  RDF extends MaybeDeserializeResultDataFn = MaybeDeserializeResultDataFn,
  ASF extends MaybeDeserializeActionSummariesFn = MaybeDeserializeActionSummariesFn,
  ESF extends MaybeDeserializeExecutionStepsFn = MaybeDeserializeExecutionStepsFn,
>(
  args: SendSignedTransactionArgs<TPS, RDF, ASF, ESF>,
) => Promise<SendSignedTransactionOutput<TPS, RDF, ASF, ESF>>;

export type CreateSafeSendSignedTransaction = (
  clientContext: ClientContext,
) => SafeSendSignedTransaction;
