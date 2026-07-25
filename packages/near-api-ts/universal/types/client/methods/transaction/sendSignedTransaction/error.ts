import type { NatError } from '../../../../../src/_common/natError';
import type { Base64String } from '../../../../_common/common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../../_common/natError';
import type {
  MaybeBaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionExecutionStepsFn,
} from '../../../../_common/transactionDetails/_common/_common/deserializers';
import type { ExecutionFailureKind } from '../../../../_common/transactionDetails/_common/_common/executionFailureError';
import type {
  MaybeTransactionProcessingStage,
  ReachableProcessingStageFromStage,
  TransactionProcessingStage,
} from '../../../../_common/transactionDetails/_common/processingStage';
import type { ExecutionFailure } from '../../../../_common/transactionDetails/executionFailure';
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

  'Client.SendSignedTransaction.Rpc.Timeout': unknown;
  'Client.SendSignedTransaction.Rpc.Expired': unknown;
  'Client.SendSignedTransaction.Rpc.Signer.NotFound': unknown;
  'Client.SendSignedTransaction.Rpc.Signer.NotEnoughBalance': unknown;
  'Client.SendSignedTransaction.Rpc.Nonce.Invalid': unknown;
  'Client.SendSignedTransaction.Rpc.Signature.Invalid': unknown;

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

export type ExecutionFailureErrorAtStage<
  S extends ReachableProcessingStageFromStage['ExecutedOptimistic'],
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
  EK extends ExecutionFailureKind = ExecutionFailureKind,
> = EK extends EK // turn on distributive conditional type
  ? NatError<
      `Client.SendSignedTransaction.Rpc.${EK}`,
      {
        signedTransactionBorsh64: Base64String;
        transactionDetails: ExecutionFailure<ASF, ESF>[S];
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
