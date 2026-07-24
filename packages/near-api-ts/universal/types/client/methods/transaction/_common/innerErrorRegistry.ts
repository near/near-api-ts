import type { NatError } from '../../../../../src/_common/natError';
import type { Base64String, CryptoHash } from '../../../../_common/common';
import type { RawActionSummary } from '../../../../_common/transactionDetails/actionSummaries';
import type {
  MaybeBaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionExecutionStepsFn,
} from '../../../../_common/transactionDetails/deserializers';
import type { ReachableProcessingStageFromStage } from '../../../../_common/transactionDetails/processingStage';
import type { ConversionStepSuccess } from '../../../../_common/transactionDetails/processingSteps/conversionStep/conversionStep';
import type {
  ExecutionFailure,
  ExecutionFailureKind,
} from '../../../../_common/transactionDetails/processingSteps/executionSteps/executionFailure';
import type {
  ExecutionSteps,
  RawExecutionStep,
} from '../../../../_common/transactionDetails/processingSteps/executionSteps/executionStep';
import type { RefundStep } from '../../../../_common/transactionDetails/processingSteps/refundStep';
import type { ExhaustedErrorContext } from '../../../transport/sendRequest';

type RefundSteps<S extends ReachableProcessingStageFromStage['ExecutedOptimistic']> =
  S extends 'CompletedFinal' ? { refundSteps: RefundStep[] } : unknown;

export type ExecutionFailureContext<
  S extends ReachableProcessingStageFromStage['ExecutedOptimistic'],
  EK extends ExecutionFailureKind,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> = {
  signedTransactionBorsh64: Base64String;
  transactionDetails: {
    processingStage: S;
    transactionHash: CryptoHash;
    error: ExecutionFailure<EK>;
    processingSteps: {
      conversionStep: ConversionStepSuccess<ASF>;
      executionSteps: ExecutionSteps<ESF>;
    } & RefundSteps<S>;
  };
};

export type ExecutionFailureErrorByStage<
  S extends ReachableProcessingStageFromStage['ExecutedOptimistic'],
  P extends 'Client.SendSignedTransaction' | 'Inner.Client.TransactionDetails',
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
  EK extends ExecutionFailureKind = ExecutionFailureKind,
> = EK extends EK // turn on distributive conditional type
  ? NatError<`${P}.Rpc.${EK}`, ExecutionFailureContext<S, EK, ASF, ESF>>
  : never;

// TODO figure out if we will reuse it at all - if not - remove
interface ExecutionFailureInnerErrorRegistry {
  'Inner.Client.TransactionDetails.Rpc.Executor.NotFound': unknown;
  'Inner.Client.TransactionDetails.Rpc.Executor.NotEnoughBalance': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.Forbidden': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.CreateAccount.AlreadyExists': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.CreateAccount.TopLevelNamespace': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.CreateAccount.ForeignNamespace': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.CreateAccount.ImplicitAccount': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.AddKey.AlreadyExists': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.FunctionCall.Wasm.NotFound': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.FunctionCall.Function.NotFound': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.FunctionCall.Compilation.Failed': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.FunctionCall.Execution.Failed': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.Stake.BelowThreshold': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.Stake.NotEnoughBalance': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.Stake.NotFound': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.DeleteKey.NotFound': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.DeleteAccount.Staking': unknown;
  'Inner.Client.TransactionDetails.Rpc.Action.DeleteAccount.LargeState': unknown;
}

export interface TransactionDetailsInnerErrorRegistry extends ExecutionFailureInnerErrorRegistry {
  'Inner.Client.TransactionDetails.Exhausted': ExhaustedErrorContext;
  'Inner.Client.TransactionDetails.DeserializeResultData.Failed': {
    cause: unknown;
    rawData: Base64String;
  };
  'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed': {
    cause: unknown;
    rawActionSummaries: RawActionSummary[];
  };
  'Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed': {
    cause: unknown;
    rawExecutionSteps: RawExecutionStep[];
  };
}
