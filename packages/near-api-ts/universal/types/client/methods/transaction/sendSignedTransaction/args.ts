import type { Base64String, TransactionHash } from '../../../../_common/common';
import type {
  MaybeBaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionExecutionStepsFn,
  MaybeBaseDeserializeTransactionResultDataFn,
} from '../../../../_common/transactionDetails/deserializers';
import type { MaybeTransactionProcessingStage } from '../../../../_common/transactionDetails/processingStage';
import type { KeyIf } from '../../../../utils';
import type { PartialTransportPolicy } from '../../../transport/transport';

type Options<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn,
> = [RDF, ASF, ESF] extends [undefined, undefined, undefined]
  ? {
      options?: {
        transportPolicy?: PartialTransportPolicy;
        signal?: AbortSignal;
        deserializeResultData?: never;
        deserializeActionSummaries?: never;
        deserializeExecutionSteps?: never;
      };
    }
  : {
      options: {
        transportPolicy?: PartialTransportPolicy;
        signal?: AbortSignal;
      } & KeyIf<'deserializeResultData', RDF> &
        KeyIf<'deserializeActionSummaries', ASF> &
        KeyIf<'deserializeExecutionSteps', ESF>;
    };

export type SendSignedTransactionArgs<
  TPS extends MaybeTransactionProcessingStage,
  RDF extends MaybeBaseDeserializeTransactionResultDataFn,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn,
> = {
  signedTransaction: {
    signedTransactionBorsh64: Base64String;
    transactionHash: TransactionHash;
  };
} & KeyIf<'minimalProcessingStage', TPS> &
  Options<RDF, ASF, ESF>;
