import type { NatError } from '../../../../../src/_common/natError';
import type { Base64String, CryptoHash } from '../../../../_common/common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../../_common/natError';
import type {
  MaybeBaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionExecutionStepsFn,
} from '../../../../_common/transactionDetails/deserializers';
import type {
  MaybeTransactionProcessingStage,
  ReachableProcessingStageFromStage,
  TransactionProcessingStage,
  TransactionProcessingStageMap,
} from '../../../../_common/transactionDetails/processingStage';
import type { ConversionStepSuccess } from '../../../../_common/transactionDetails/processingSteps/conversionStep';
import type {
  ExecutionFailure,
  ExecutionFailureKind,
} from '../../../../_common/transactionDetails/processingSteps/executionSteps/executionFailure';
import type { ExecutionSteps } from '../../../../_common/transactionDetails/processingSteps/executionSteps/executionStep';
import type { RefundStep } from '../../../../_common/transactionDetails/processingSteps/refundStep';
import type {
  AbortedErrorContext,
  ExhaustedErrorContext,
  PreferredRpcNotFoundErrorContext,
  TimeoutErrorContext,
} from '../../../transport/sendRequest';
import type { TransactionDetailsInnerErrorRegistry } from '../_common/innerErrorRegistry';

export interface SendSignedTransactionPublicErrorRegistry {
  'Client.SendSignedTransaction.Args.InvalidSchema': InvalidSchemaErrorContext;
  'Client.SendSignedTransaction.PreferredRpc.NotFound': PreferredRpcNotFoundErrorContext;
  'Client.SendSignedTransaction.Timeout': TimeoutErrorContext;
  'Client.SendSignedTransaction.Aborted': AbortedErrorContext;
  'Client.SendSignedTransaction.Exhausted': ExhaustedErrorContext;
  'Client.SendSignedTransaction.Rpc.Executor.NotFound': unknown;
  'Client.SendSignedTransaction.Rpc.Executor.NotEnoughBalance': unknown;
  'Client.SendSignedTransaction.Rpc.Action.Forbidden': unknown;
  'Client.SendSignedTransaction.Rpc.Action.CreateAccount.AlreadyExists': unknown;
  'Client.SendSignedTransaction.Rpc.Action.CreateAccount.TopLevelNamespace': unknown;
  'Client.SendSignedTransaction.Rpc.Action.CreateAccount.ForeignNamespace': unknown;
  'Client.SendSignedTransaction.Rpc.Action.CreateAccount.ImplicitAccount': unknown;
  'Client.SendSignedTransaction.Rpc.Action.AddKey.AlreadyExists': unknown;
  'Client.SendSignedTransaction.Rpc.Action.FunctionCall.Wasm.NotFound': unknown;
  'Client.SendSignedTransaction.Rpc.Action.FunctionCall.Function.NotFound': unknown;
  'Client.SendSignedTransaction.Rpc.Action.FunctionCall.Compilation.Failed': unknown;
  'Client.SendSignedTransaction.Rpc.Action.FunctionCall.Execution.Failed': unknown;
  'Client.SendSignedTransaction.Rpc.Action.Stake.BelowThreshold': unknown;
  'Client.SendSignedTransaction.Rpc.Action.Stake.NotEnoughBalance': unknown;
  'Client.SendSignedTransaction.Rpc.Action.Stake.NotFound': unknown;
  'Client.SendSignedTransaction.Rpc.Action.DeleteKey.NotFound': unknown;
  'Client.SendSignedTransaction.Rpc.Action.DeleteAccount.Staking': unknown;
  'Client.SendSignedTransaction.Rpc.Action.DeleteAccount.LargeState': unknown;
  'Client.SendSignedTransaction.DeserializeResultData.Failed': TransactionDetailsInnerErrorRegistry['Inner.Client.TransactionDetails.DeserializeResultData.Failed'];
  'Client.SendSignedTransaction.DeserializeActionSummaries.Failed': TransactionDetailsInnerErrorRegistry['Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'];
  'Client.SendSignedTransaction.DeserializeExecutionSteps.Failed': TransactionDetailsInnerErrorRegistry['Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed'];
  'Client.SendSignedTransaction.Internal': InternalErrorContext;
}

type RefundSteps<S extends ReachableProcessingStageFromStage['ExecutedOptimistic']> =
  S extends 'CompletedFinal' ? { refundSteps: RefundStep[] } : unknown;

type ExecutionFailureContext<
  S extends ReachableProcessingStageFromStage['ExecutedOptimistic'],
  EK extends ExecutionFailureKind,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> = {
  signedTransactionBorsh64: Base64String;
  transactionDetails: {
    processingStage: TransactionProcessingStageMap[S];
    transactionHash: CryptoHash;
    error: ExecutionFailure<EK>;
    processingSteps: {
      conversionStep: ConversionStepSuccess<ASF>;
      executionSteps: ExecutionSteps<ESF>;
    } & RefundSteps<S>;
  };
};

type CommonErrorForAllStages =
  | NatError<'Client.SendSignedTransaction.Args.InvalidSchema'>
  | NatError<'Client.SendSignedTransaction.PreferredRpc.NotFound'>
  | NatError<'Client.SendSignedTransaction.Timeout'>
  | NatError<'Client.SendSignedTransaction.Aborted'>
  | NatError<'Client.SendSignedTransaction.Exhausted'>
  | NatError<'Client.SendSignedTransaction.DeserializeResultData.Failed'>
  | NatError<'Client.SendSignedTransaction.DeserializeActionSummaries.Failed'>
  | NatError<'Client.SendSignedTransaction.DeserializeExecutionSteps.Failed'>
  | NatError<'Client.SendSignedTransaction.Internal'>;

// Distributes over `ExecutionFailureErrorKind`, producing one `NatError` per
// kind, whose name and context stay correlated by construction.
type ExecutionFailureErrorByStage<
  S extends ReachableProcessingStageFromStage['ExecutedOptimistic'],
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn,
  EK extends ExecutionFailureKind = ExecutionFailureKind,
> = EK extends unknown
  ? NatError<`Client.SendSignedTransaction.Rpc.${EK}`, ExecutionFailureContext<S, EK, ASF, ESF>>
  : never;

type SendSignedTransactionErrorByStage<
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn,
> = {
  ConvertedOptimistic: CommonErrorForAllStages;
  ConvertedFinal: CommonErrorForAllStages;
  ExecutedOptimistic:
    | CommonErrorForAllStages
    | ExecutionFailureErrorByStage<'ExecutedOptimistic', ASF, ESF>;
  ExecutedNearlyFinal:
    | CommonErrorForAllStages
    | ExecutionFailureErrorByStage<'ExecutedNearlyFinal', ASF, ESF>;
  CompletedFinal:
    | CommonErrorForAllStages
    | ExecutionFailureErrorByStage<'CompletedFinal', ASF, ESF>;
};

type SendSignedTransactionErrorFromStage<
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> = {
  [S in TransactionProcessingStage]: SendSignedTransactionErrorByStage<
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
