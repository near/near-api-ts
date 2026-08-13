import type { NatError } from '../../../../../src/_common/_common/_common/natError';
import type { Base64String } from '../../../../_common/common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../../_common/natError';
import type {
  AbortedErrorContext,
  ExhaustedErrorContext,
  PreferredRpcNotFoundErrorContext,
  TimeoutErrorContext,
} from '../../../transport/sendRequest';
import type { TransactionDetailsInnerErrorRegistry } from '../_common/innerErrorRegistry';
import type {
  ConversionFailureError,
  ConversionFailureKind,
} from '../_common/transactionDetails/_common/_common/conversionFailureError';
import type {
  MaybeBaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionExecutionStepsFn,
} from '../_common/transactionDetails/_common/_common/deserializers';
import type { ExecutionFailureKind } from '../_common/transactionDetails/_common/_common/executionFailureError';
import type {
  MaybeTransactionProcessingStage,
  ReachableProcessingStageFromStage,
  TransactionProcessingStage,
} from '../_common/transactionDetails/_common/processingStage';
import type { ExecutionFailure } from '../_common/transactionDetails/executionFailure';

// Every conversion failure kind is surfaced as its own `Rpc.<kind>` error. The context is the
// conversion failure context flattened next to `signedTransactionBorsh64` (see `handleRpcError`).
type ConversionFailurePublicErrorRegistry = {
  [CF in ConversionFailureKind as `Client.SendSignedTransaction.Rpc.${CF}`]: {
    info: ConversionFailureError<CF>['context'];
    signedTransactionBorsh64: Base64String;
  };
};

// Same for execution failure kinds, except their context also carries `transactionDetails`,
// whose shape depends on the stage and on the deserializer type params — which a flat registry
// cannot express. So the registry pins only the part that is always present, and
// `ExecutionFailureErrorAtStage` passes the full (assignable) context explicitly.
type ExecutionFailurePublicErrorRegistry = {
  [EK in ExecutionFailureKind as `Client.SendSignedTransaction.Rpc.${EK}`]: {
    signedTransactionBorsh64: Base64String;
  };
};

export interface SendSignedTransactionPublicErrorRegistry
  extends ConversionFailurePublicErrorRegistry,
    ExecutionFailurePublicErrorRegistry {
  'Client.SendSignedTransaction.Args.InvalidSchema': InvalidSchemaErrorContext;
  'Client.SendSignedTransaction.PreferredRpc.NotFound': PreferredRpcNotFoundErrorContext;
  'Client.SendSignedTransaction.Timeout': TimeoutErrorContext;
  'Client.SendSignedTransaction.Aborted': AbortedErrorContext;
  'Client.SendSignedTransaction.Exhausted': ExhaustedErrorContext;
  'Client.SendSignedTransaction.Rpc.Timeout': null;
  'Client.SendSignedTransaction.DeserializeResultData.Failed': TransactionDetailsInnerErrorRegistry['Inner.Client.TransactionDetails.DeserializeResultData.Failed'];
  'Client.SendSignedTransaction.DeserializeActionSummaries.Failed': TransactionDetailsInnerErrorRegistry['Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'];
  'Client.SendSignedTransaction.DeserializeExecutionSteps.Failed': TransactionDetailsInnerErrorRegistry['Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed'];
  'Client.SendSignedTransaction.Internal': InternalErrorContext;
}

export type ConversionFailureNatError<CF extends ConversionFailureKind = ConversionFailureKind> =
  CF extends CF // turn on distributive conditional type
    ? NatError<`Client.SendSignedTransaction.Rpc.${CF}`>
    : never;

type CommonErrorForAllStages =
  | ConversionFailureNatError
  | NatError<'Client.SendSignedTransaction.Args.InvalidSchema'>
  | NatError<'Client.SendSignedTransaction.PreferredRpc.NotFound'>
  | NatError<'Client.SendSignedTransaction.Timeout'>
  | NatError<'Client.SendSignedTransaction.Aborted'>
  | NatError<'Client.SendSignedTransaction.Exhausted'>
  | NatError<'Client.SendSignedTransaction.Rpc.Timeout'>
  | NatError<'Client.SendSignedTransaction.DeserializeResultData.Failed'>
  | NatError<'Client.SendSignedTransaction.DeserializeActionSummaries.Failed'>
  | NatError<'Client.SendSignedTransaction.DeserializeExecutionSteps.Failed'>
  | NatError<'Client.SendSignedTransaction.Internal'>;

export type ExecutionFailureErrorAtStage<
  S extends ReachableProcessingStageFromStage['ExecutedOptimistic'],
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
  EK extends ExecutionFailureKind = ExecutionFailureKind,
> = EK extends EK // turn on distributive conditional type
  ? NatError<
      `Client.SendSignedTransaction.Rpc.${EK}`,
      {
        transactionDetails: ExecutionFailure<ASF, ESF>[S];
        signedTransactionBorsh64: Base64String;
      }
    >
  : never;

type SendSignedTransactionErrorAtStage<
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn,
> = {
  ConvertedOptimistic: CommonErrorForAllStages;
  ConvertedFinal: CommonErrorForAllStages;
  ExecutedOptimistic:
    | CommonErrorForAllStages
    | ExecutionFailureErrorAtStage<'ExecutedOptimistic', ASF, ESF>;
  ExecutedNearlyFinal:
    | CommonErrorForAllStages
    | ExecutionFailureErrorAtStage<'ExecutedNearlyFinal', ASF, ESF>;
  CompletedFinal:
    | CommonErrorForAllStages
    | ExecutionFailureErrorAtStage<'CompletedFinal', ASF, ESF>;
};

type SendSignedTransactionErrorFromStage<
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> = {
  [S in TransactionProcessingStage]: SendSignedTransactionErrorAtStage<
    ASF,
    ESF
  >[ReachableProcessingStageFromStage[S]];
};

export type SendSignedTransactionError<
  TPS extends MaybeTransactionProcessingStage = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> = [TPS] extends [undefined]
  ? SendSignedTransactionErrorFromStage<ASF, ESF>['ExecutedOptimistic']
  : SendSignedTransactionErrorFromStage<ASF, ESF>[Exclude<TPS, undefined>];
