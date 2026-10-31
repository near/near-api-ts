import type { ConversionFailureKind } from '../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/conversionFailureError';
import type { LiveExecutionFailureKind } from '../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/executionFailureError';
import type { ReachableProcessingStageFromStage } from '../../../types/client/methods/transaction/_common/transactionDetails/_common/processingStage';
import type { ExecutionFailure } from '../../../types/client/methods/transaction/_common/transactionDetails/executionFailure';
import type { TimeoutErrorContext } from '../../../types/client/transport/sendRequest';
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

// A send error a signer can't run into isn't there
type _InvalidSignature = Expect<
  Equal<Has<'Signer.ExecuteTransaction.Rpc.Signature.Invalid'>, false>
>;
type _Aborted = Expect<Equal<Has<'Signer.ExecuteTransaction.Aborted'>, false>>;
type _Deserialize = Expect<Equal<Has<`Signer.ExecuteTransaction.Deserialize${string}`>, false>>;
