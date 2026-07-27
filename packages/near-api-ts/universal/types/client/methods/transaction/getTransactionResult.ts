import type { NatError } from '../../../../src/_common/natError';
import type { CryptoHash, Result } from '../../../_common/common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../_common/natError';
import type {
  MaybeBaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionExecutionStepsFn,
  MaybeBaseDeserializeTransactionResultDataFn,
} from '../../../_common/transactionDetails/_common/_common/deserializers';
import type { TransactionProcessingStageMap } from '../../../_common/transactionDetails/_common/processingStage';
import type { ConversionFailure } from '../../../_common/transactionDetails/conversionFailure';
import type { ExecutionFailure } from '../../../_common/transactionDetails/executionFailure';
import type { ExecutionSuccess } from '../../../_common/transactionDetails/executionSuccess';
import type { KeyIf } from '../../../utils';
import type { ClientContext } from '../../client';
import type {
  AbortedErrorContext,
  ExhaustedErrorContext,
  PreferredRpcNotFoundErrorContext,
  TimeoutErrorContext,
} from '../../transport/sendRequest';
import type { PartialTransportPolicy } from '../../transport/transport';
import type { TransactionDetailsInnerErrorRegistry } from './_common/innerErrorRegistry';

export interface GetTransactionResultPublicErrorRegistry {
  'Client.GetTransactionResult.Args.InvalidSchema': InvalidSchemaErrorContext;
  'Client.GetTransactionResult.PreferredRpc.NotFound': PreferredRpcNotFoundErrorContext;
  'Client.GetTransactionResult.Timeout': TimeoutErrorContext;
  'Client.GetTransactionResult.Aborted': AbortedErrorContext;
  'Client.GetTransactionResult.Exhausted': ExhaustedErrorContext;
  'Client.GetTransactionResult.Rpc.Transaction.NotFound': {
    transactionHash: CryptoHash;
  };
  'Client.GetTransactionResult.Rpc.Transaction.NotCompleted': {
    transactionHash: CryptoHash;
    currentProcessingStage:
      | TransactionProcessingStageMap['ConvertedOptimistic']
      | TransactionProcessingStageMap['ConvertedFinal']
      | TransactionProcessingStageMap['ExecutedOptimistic']
      | TransactionProcessingStageMap['ExecutedNearlyFinal'];
  };
  'Client.GetTransactionResult.DeserializeResultData.Failed': TransactionDetailsInnerErrorRegistry['Inner.Client.TransactionDetails.DeserializeResultData.Failed'];
  'Client.GetTransactionResult.DeserializeActionSummaries.Failed': TransactionDetailsInnerErrorRegistry['Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'];
  'Client.GetTransactionResult.DeserializeExecutionSteps.Failed': TransactionDetailsInnerErrorRegistry['Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed'];
  'Client.GetTransactionResult.Internal': InternalErrorContext;
}

type Options<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
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

export type GetTransactionResultArgs<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> = {
  transactionHash: CryptoHash;
} & Options<RDF, ASF, ESF>;

export type GetTransactionResultOutput<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> =
  | ConversionFailure<ASF>['CompletedFinal']
  | ExecutionFailure<ASF, ESF>['CompletedFinal']
  | ExecutionSuccess<RDF, ASF, ESF>['CompletedFinal'];

export type GetTransactionResultError =
  | NatError<'Client.GetTransactionResult.Args.InvalidSchema'>
  | NatError<'Client.GetTransactionResult.PreferredRpc.NotFound'>
  | NatError<'Client.GetTransactionResult.Timeout'>
  | NatError<'Client.GetTransactionResult.Aborted'>
  | NatError<'Client.GetTransactionResult.Exhausted'>
  | NatError<'Client.GetTransactionResult.Rpc.Transaction.NotFound'>
  | NatError<'Client.GetTransactionResult.Rpc.Transaction.NotCompleted'>
  | NatError<'Client.GetTransactionResult.DeserializeResultData.Failed'>
  | NatError<'Client.GetTransactionResult.DeserializeActionSummaries.Failed'>
  | NatError<'Client.GetTransactionResult.DeserializeExecutionSteps.Failed'>
  | NatError<'Client.GetTransactionResult.Internal'>;

export type SafeGetTransactionResult = <
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
>(
  args: GetTransactionResultArgs<RDF, ASF, ESF>,
) => Promise<Result<GetTransactionResultOutput<RDF, ASF, ESF>, GetTransactionResultError>>;

export type GetTransactionResult = <
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
>(
  args: GetTransactionResultArgs<RDF, ASF, ESF>,
) => Promise<GetTransactionResultOutput<RDF, ASF, ESF>>;

export type CreateSafeGetTransactionResult = (
  clientContext: ClientContext,
) => SafeGetTransactionResult;
