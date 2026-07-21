import type { NatError } from '../../../../../src/_common/natError';
import type { Base64String, CryptoHash } from '../../../../_common/common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../../_common/natError';
import type { TransactionErrorContext } from '../../../../_common/transaction/rpcTransactionErrorContext';
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
  'Client.SendSignedTransaction.Rpc.Action.CreateAccount.AlreadyExists': unknown;

  // TODO will rework it later
  'Client.SendSignedTransaction.Rpc.Transaction.Expired': TransactionErrorContext['Expired'];
  'Client.SendSignedTransaction.Rpc.Transaction.Nonce.Invalid': TransactionErrorContext['Nonce']['Invalid'];
  // TODO: Signer.NotEnoughBalance
  'Client.SendSignedTransaction.Rpc.Transaction.Signer.Balance.TooLow': TransactionErrorContext['Signer']['Balance']['TooLow'];
  'Client.SendSignedTransaction.Rpc.Transaction.Signer.NotFound': TransactionErrorContext['Signer']['NotFound'];
  'Client.SendSignedTransaction.Rpc.Transaction.Signature.Invalid': TransactionErrorContext['Signature']['Invalid'];
  'Client.SendSignedTransaction.Rpc.Transaction.Receiver.NotFound': TransactionErrorContext['Receiver']['NotFound'];
  'Client.SendSignedTransaction.Rpc.Transaction.Timeout': TransactionErrorContext['Timeout'];
  //
  'Client.SendSignedTransaction.Rpc.Transaction.Action.CreateAccount.AlreadyExist': TransactionErrorContext['Action']['CreateAccount']['AlreadyExist'];
  'Client.SendSignedTransaction.Rpc.Transaction.Action.Stake.BelowThreshold': TransactionErrorContext['Action']['Stake']['BelowThreshold'];
  'Client.SendSignedTransaction.Rpc.Transaction.Action.Stake.Balance.TooLow': TransactionErrorContext['Action']['Stake']['Balance']['TooLow'];
  'Client.SendSignedTransaction.Rpc.Transaction.Action.Stake.NotFound': TransactionErrorContext['Action']['Stake']['NotFound'];
  //
  'Client.SendSignedTransaction.DeserializeResultData.Failed': TransactionDetailsInnerErrorRegistry['Inner.Client.TransactionDetails.DeserializeResultData.Failed'];
  'Client.SendSignedTransaction.DeserializeActionSummaries.Failed': TransactionDetailsInnerErrorRegistry['Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'];
  'Client.SendSignedTransaction.DeserializeExecutionSteps.Failed': TransactionDetailsInnerErrorRegistry['Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed'];
  'Client.SendSignedTransaction.Internal': InternalErrorContext;
}

type ExecutionFailureContextAtStageExecutedOptimistic<
  EK extends ExecutionFailureKind,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> = {
  signedTransactionBorsh64: Base64String;
  transactionDetails: {
    processingStage: TransactionProcessingStageMap['ExecutedOptimistic'];
    transactionHash: CryptoHash;
    error: ExecutionFailure<EK>;
    processingSteps: {
      conversionStep: ConversionStepSuccess<ASF>;
      executionSteps: ExecutionSteps<ESF>;
    };
  };
};

type ExecutionFailureContextAtStageExecutedNearlyFinal<
  EK extends ExecutionFailureKind,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> = {
  signedTransactionBorsh64: Base64String;
  transactionDetails: {
    processingStage: TransactionProcessingStageMap['ExecutedNearlyFinal'];
    transactionHash: CryptoHash;
    error: ExecutionFailure<EK>;
    processingSteps: {
      conversionStep: ConversionStepSuccess<ASF>;
      executionSteps: ExecutionSteps<ESF>;
    };
  };
};

type ExecutionFailureContextAtStageCompletedFinal<
  EK extends ExecutionFailureKind,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> = {
  signedTransactionBorsh64: Base64String;
  transactionDetails: {
    processingStage: TransactionProcessingStageMap['CompletedFinal'];
    transactionHash: CryptoHash;
    error: ExecutionFailure<EK>;
    processingSteps: {
      conversionStep: ConversionStepSuccess<ASF>;
      executionSteps: ExecutionSteps<ESF>;
      refundSteps: RefundStep[];
    };
  };
};

type CommonSendSignedTransactionErrorForAllStages =
  | NatError<'Client.SendSignedTransaction.Args.InvalidSchema'>
  | NatError<'Client.SendSignedTransaction.PreferredRpc.NotFound'>
  | NatError<'Client.SendSignedTransaction.Timeout'>
  | NatError<'Client.SendSignedTransaction.Aborted'>
  | NatError<'Client.SendSignedTransaction.Exhausted'>
  | NatError<'Client.SendSignedTransaction.DeserializeResultData.Failed'>
  | NatError<'Client.SendSignedTransaction.DeserializeActionSummaries.Failed'>
  | NatError<'Client.SendSignedTransaction.DeserializeExecutionSteps.Failed'>
  | NatError<'Client.SendSignedTransaction.Internal'>
  // TODO remove this
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Receiver.NotFound'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Expired'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Nonce.Invalid'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Signer.NotFound'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Signature.Invalid'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Signer.Balance.TooLow'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Timeout'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Action.CreateAccount.AlreadyExist'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Action.Stake.BelowThreshold'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Action.Stake.Balance.TooLow'>
  | NatError<'Client.SendSignedTransaction.Rpc.Transaction.Action.Stake.NotFound'>;

type SendSignedTransactionErrorAtStageConvertedOptimistic =
  CommonSendSignedTransactionErrorForAllStages;

type SendSignedTransactionErrorAtStageConvertedFinal = CommonSendSignedTransactionErrorForAllStages;

type SendSignedTransactionErrorAtStageExecutedOptimistic<
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> =
  | CommonSendSignedTransactionErrorForAllStages
  | NatError<
      'Client.SendSignedTransaction.Rpc.Executor.NotFound',
      ExecutionFailureContextAtStageExecutedOptimistic<'Executor.NotFound', ASF, ESF>
    >
  | NatError<
      'Client.SendSignedTransaction.Rpc.Action.CreateAccount.AlreadyExists',
      ExecutionFailureContextAtStageExecutedOptimistic<
        'Action.CreateAccount.AlreadyExists',
        ASF,
        ESF
      >
    >;

type SendSignedTransactionErrorAtStageExecutedNearlyFinal<
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> =
  | CommonSendSignedTransactionErrorForAllStages
  | NatError<
      'Client.SendSignedTransaction.Rpc.Executor.NotFound',
      ExecutionFailureContextAtStageExecutedNearlyFinal<'Executor.NotFound', ASF, ESF>
    >
  | NatError<
      'Client.SendSignedTransaction.Rpc.Action.CreateAccount.AlreadyExists',
      ExecutionFailureContextAtStageExecutedNearlyFinal<
        'Action.CreateAccount.AlreadyExists',
        ASF,
        ESF
      >
    >;

type SendSignedTransactionErrorAtStageCompletedFinal<
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> =
  | CommonSendSignedTransactionErrorForAllStages
  | NatError<
      'Client.SendSignedTransaction.Rpc.Executor.NotFound',
      ExecutionFailureContextAtStageCompletedFinal<'Executor.NotFound', ASF, ESF>
    >
  | NatError<
      'Client.SendSignedTransaction.Rpc.Action.CreateAccount.AlreadyExists',
      ExecutionFailureContextAtStageCompletedFinal<'Action.CreateAccount.AlreadyExists', ASF, ESF>
    >;

type SendSignedTransactionErrorByStage<
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> = {
  ConvertedOptimistic: SendSignedTransactionErrorAtStageConvertedOptimistic;
  ConvertedFinal: SendSignedTransactionErrorAtStageConvertedFinal;
  ExecutedOptimistic: SendSignedTransactionErrorAtStageExecutedOptimistic<ASF, ESF>;
  ExecutedNearlyFinal: SendSignedTransactionErrorAtStageExecutedNearlyFinal<ASF, ESF>;
  CompletedFinal: SendSignedTransactionErrorAtStageCompletedFinal<ASF, ESF>;
};

export type SendSignedTransactionErrorFromStage<
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
