import type { ConversionFailureKind } from '../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/conversionFailureError';
import type { LiveExecutionFailureKind } from '../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/executionFailureError';
import type { ReachableProcessingStageFromStage } from '../../../types/client/methods/transaction/_common/transactionDetails/_common/processingStage';
import type { ExecutionFailure } from '../../../types/client/methods/transaction/_common/transactionDetails/executionFailure';
import type { SendSignedTransactionDeserializeActionSummariesArgs } from '../../../types/client/methods/transaction/sendSignedTransaction/args';
import type { SendSignedTransactionPublicErrorRegistry } from '../../../types/client/methods/transaction/sendSignedTransaction/error';
import type {
  AbortedErrorContext,
  TimeoutErrorContext,
} from '../../../types/client/transport/sendRequest';
import type { ExecuteTransactionError } from '../../../types/signer/public/createExecuteTransaction';
import type { ExcludeStrict } from '../../../types/utils';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

type Kind = ExecuteTransactionError['kind'];
type ErrorOf<K extends Kind> = Extract<ExecuteTransactionError, { kind: K }>;
type Has<K extends string> = [Extract<Kind, K>] extends [never] ? false : true;

// A send error comes under the signer's prefix with its context: a transport one,
type _Timeout = Expect<
  Equal<ErrorOf<'Signer.ExecuteTransaction.Timeout'>['context'], TimeoutErrorContext>
>;

// every conversion failure but an invalid signature - an access key's permission included,
// as a key may change under a running signer, and an expired block hash once the retries are spent,
type _Conversions = Expect<
  Equal<
    Exclude<
      `Signer.ExecuteTransaction.Rpc.${ExcludeStrict<ConversionFailureKind, 'Signature.Invalid'>}`,
      Kind
    >,
    never
  >
>;

// and every execution failure, with the details at any stage the node may answer with when
// the signer sends at the default one
type _Executions = Expect<
  Equal<Exclude<`Signer.ExecuteTransaction.Rpc.${LiveExecutionFailureKind}`, Kind>, never>
>;
type _Details = Expect<
  Equal<
    ErrorOf<'Signer.ExecuteTransaction.Rpc.Executor.NotFound'>['context']['transactionDetails'],
    ExecutionFailure<'Live'>[ReachableProcessingStageFromStage['ExecutedOptimistic']]
  >
>;

// The details follow the stage and the deserializers of the call, as for sendSignedTransaction
type DetailsOf<E> = E extends {
  kind: 'Signer.ExecuteTransaction.Rpc.Executor.NotFound';
  context: { transactionDetails: infer D };
}
  ? D
  : never;

declare const deserializeActionSummaries: (
  args: SendSignedTransactionDeserializeActionSummariesArgs,
) => number;

type _DetailsAtStage = Expect<
  Equal<
    DetailsOf<ExecuteTransactionError<'CompletedFinal'>>,
    ExecutionFailure<'Live'>['CompletedFinal']
  >
>;
type _DeserializedDetails = Expect<
  Equal<
    DetailsOf<ExecuteTransactionError<'CompletedFinal', typeof deserializeActionSummaries>>,
    ExecutionFailure<'Live', typeof deserializeActionSummaries>['CompletedFinal']
  >
>;

// The signal and the deserializers are passed on, so an aborted send and a failed deserializer
// come too - Aborted also when the signer itself sees the call aborted before the send
type _Aborted = Expect<
  Equal<ErrorOf<'Signer.ExecuteTransaction.Aborted'>['context'], AbortedErrorContext>
>;
type _DeserializeResultData = Expect<
  Equal<
    ErrorOf<'Signer.ExecuteTransaction.DeserializeResultData.Failed'>['context'],
    SendSignedTransactionPublicErrorRegistry['Client.SendSignedTransaction.DeserializeResultData.Failed']
  >
>;
type _DeserializeActionSummaries = Expect<
  Equal<
    ErrorOf<'Signer.ExecuteTransaction.DeserializeActionSummaries.Failed'>['context'],
    SendSignedTransactionPublicErrorRegistry['Client.SendSignedTransaction.DeserializeActionSummaries.Failed']
  >
>;
type _DeserializeExecutionSteps = Expect<
  Equal<
    ErrorOf<'Signer.ExecuteTransaction.DeserializeExecutionSteps.Failed'>['context'],
    SendSignedTransactionPublicErrorRegistry['Client.SendSignedTransaction.DeserializeExecutionSteps.Failed']
  >
>;

// A send error a signer can't run into isn't there
type _InvalidSignature = Expect<
  Equal<Has<'Signer.ExecuteTransaction.Rpc.Signature.Invalid'>, false>
>;
