import type { NatError } from '../../../../../src/_common/_common/_common/_common/natError';
import type { Base64String } from '../../../../_common/common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../../_common/natError';
import type {
  AbortedErrorContext,
  ExhaustedErrorContext,
  PreferredRpcNotFoundErrorContext,
  TimeoutErrorContext,
} from '../../../transport/sendRequest';
import type {
  DeserializeActionSummariesFailedContext,
  DeserializeExecutionStepsFailedContext,
  TransactionDetailsInnerErrorRegistry,
} from '../_common/innerErrorRegistry';
import type {
  ConversionFailureError,
  ConversionFailureKind,
} from '../_common/transactionDetails/_common/_common/conversionFailureError';
import type {
  MaybeBaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionExecutionStepsFn,
} from '../_common/transactionDetails/_common/_common/deserializers';
import type { ExecutionFailureKind } from '../_common/transactionDetails/_common/_common/executionFailureError';
import type { ProtocolEra } from '../_common/transactionDetails/_common/_common/protocolEra';
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
  'Client.SendSignedTransaction.Rpc.Timeout': null; // Remove - should use only lib's own .Timeout
  'Client.SendSignedTransaction.DeserializeResultData.Failed': TransactionDetailsInnerErrorRegistry['Inner.Client.TransactionDetails.DeserializeResultData.Failed'];
  'Client.SendSignedTransaction.DeserializeActionSummaries.Failed': DeserializeActionSummariesFailedContext<'Live'>;
  'Client.SendSignedTransaction.DeserializeExecutionSteps.Failed': DeserializeExecutionStepsFailedContext<'Live'>;
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

// `PE` is `'Live'` everywhere but in the builders the methods share, which read any transaction
export type ExecutionFailureErrorAtStage<
  S extends ReachableProcessingStageFromStage['ExecutedOptimistic'],
  PE extends ProtocolEra,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn<PE> = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn<PE> = undefined,
  EK extends ExecutionFailureKind = ExecutionFailureKind,
> = EK extends EK // turn on distributive conditional type
  ? NatError<
      `Client.SendSignedTransaction.Rpc.${EK}`,
      {
        transactionDetails: ExecutionFailure<PE, ASF, ESF>[S];
        signedTransactionBorsh64: Base64String;
      }
    >
  : never;

type SendSignedTransactionErrorAtStage<
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn<'Live'>,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn<'Live'>,
> = {
  ConvertedOptimistic: CommonErrorForAllStages;
  ConvertedFinal: CommonErrorForAllStages;
  ExecutedOptimistic:
    | CommonErrorForAllStages
    | ExecutionFailureErrorAtStage<'ExecutedOptimistic', 'Live', ASF, ESF>;
  ExecutedNearlyFinal:
    | CommonErrorForAllStages
    | ExecutionFailureErrorAtStage<'ExecutedNearlyFinal', 'Live', ASF, ESF>;
  CompletedFinal:
    | CommonErrorForAllStages
    | ExecutionFailureErrorAtStage<'CompletedFinal', 'Live', ASF, ESF>;
};

type SendSignedTransactionErrorFromStage<
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn<'Live'> = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn<'Live'> = undefined,
> = {
  [S in TransactionProcessingStage]: SendSignedTransactionErrorAtStage<
    ASF,
    ESF
  >[ReachableProcessingStageFromStage[S]];
};

export type SendSignedTransactionError<
  TPS extends MaybeTransactionProcessingStage = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn<'Live'> = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn<'Live'> = undefined,
> = [TPS] extends [undefined]
  ? SendSignedTransactionErrorFromStage<ASF, ESF>['ExecutedOptimistic']
  : SendSignedTransactionErrorFromStage<ASF, ESF>[Exclude<TPS, undefined>];
