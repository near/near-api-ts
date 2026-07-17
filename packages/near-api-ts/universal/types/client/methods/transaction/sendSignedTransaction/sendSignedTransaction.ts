import type { Result } from '../../../../_common/common';
import type {
  MaybeBaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionExecutionStepsFn,
  MaybeBaseDeserializeTransactionResultDataFn,
} from '../../../../_common/transactionDetails/deserializers';
import type { MaybeTransactionProcessingStage } from '../../../../_common/transactionDetails/processingStage';
import type { ClientContext } from '../../../client';
import type { SendSignedTransactionArgs } from './args';
import type { SendSignedTransactionError } from './error';
import type { SendSignedTransactionOutput } from './output';

export type SafeSendSignedTransaction = <
  TPS extends MaybeTransactionProcessingStage = undefined,
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
>(
  args: SendSignedTransactionArgs<TPS, RDF, ASF, ESF>,
) => Promise<Result<SendSignedTransactionOutput<TPS, RDF, ASF, ESF>, SendSignedTransactionError>>;

export type SendSignedTransaction = <
  TPS extends MaybeTransactionProcessingStage = undefined,
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
>(
  args: SendSignedTransactionArgs<TPS, RDF, ASF, ESF>,
) => Promise<SendSignedTransactionOutput<TPS, RDF, ASF, ESF>>;

export type CreateSafeSendSignedTransaction = (
  clientContext: ClientContext,
) => SafeSendSignedTransaction;
