import type { NatError } from '../../../src/_common/_common/_common/_common/natError';
import type { Result } from '../../_common/common';
import type {
  ContextFor,
  InternalErrorContext,
  InvalidSchemaErrorContext,
} from '../../_common/natError';
import type { TransactionIntent } from '../../_common/transaction/transaction';
import type {
  MaybeBaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionExecutionStepsFn,
} from '../../client/methods/transaction/_common/transactionDetails/_common/_common/deserializers';
import type { MaybeTransactionProcessingStage } from '../../client/methods/transaction/_common/transactionDetails/_common/processingStage';
import type {
  MaybeDeserializeActionSummariesFn,
  MaybeDeserializeExecutionStepsFn,
  MaybeDeserializeResultDataFn,
  TransactionSendingArgs,
} from '../../client/methods/transaction/sendSignedTransaction/args';
import type {
  SendSignedTransactionError,
  SendSignedTransactionPublicErrorRegistry,
} from '../../client/methods/transaction/sendSignedTransaction/error';
import type { SendSignedTransactionOutput } from '../../client/methods/transaction/sendSignedTransaction/output';
import type { ExcludeStrict } from '../../utils';
import type { KeyPoolInnerErrorRegistry } from '../inner/keyPool';
import type { TaskQueueInnerErrorRegistry } from '../inner/taskQueue';
import type { SignerContext } from '../signer';

// The kinds sendSignedTransaction fails with and executeTransaction doesn't - one that comes
// anyway is a bug, so it becomes Signer.ExecuteTransaction.Internal with that error as the cause
export type UnreachableSendSignedTransactionKind =
  // executeTransaction validates the args it sends with by the same schemas, the sign service
  // gives the signed transaction, and executeTransaction has its own Internal
  | 'Client.SendSignedTransaction.Args.InvalidSchema'
  | 'Client.SendSignedTransaction.Internal'
  // The sign service signs with the very key the transaction names
  | 'Client.SendSignedTransaction.Rpc.Signature.Invalid';

type ReachableSendSignedTransactionKind = ExcludeStrict<
  keyof SendSignedTransactionPublicErrorRegistry,
  UnreachableSendSignedTransactionKind
>;

// Every other sendSignedTransaction kind under the signer's prefix, with the same context - for an
// execution failure only the part every processing stage has, as in the client's registry
type RepackedSendSignedTransactionErrorRegistry = {
  [K in ReachableSendSignedTransactionKind as K extends `Client.SendSignedTransaction.${infer S}`
    ? `Signer.ExecuteTransaction.${S}`
    : never]: SendSignedTransactionPublicErrorRegistry[K];
};

// A sendSignedTransaction error under the signer's prefix, with its whole context. The kind and the
// context are read off the error's shape: inferred from the NatError class instead, they make TS
// give up on the union ("too complex to represent") once a call fills in the type params
type RepackedSendSignedTransactionError<E> = E extends { kind: infer K; context: infer C }
  ? K extends `Client.SendSignedTransaction.${infer S}`
    ? `Signer.ExecuteTransaction.${S}` extends infer RK extends
        keyof RepackedSendSignedTransactionErrorRegistry
      ? NatError<RK, C & ContextFor<RK>>
      : never
    : never
  : never;

export interface ExecuteTransactionPublicErrorRegistry
  extends RepackedSendSignedTransactionErrorRegistry {
  'Signer.ExecuteTransaction.Args.InvalidSchema': InvalidSchemaErrorContext;
  'Signer.ExecuteTransaction.KeyPool.AccessKeys.NotLoaded': KeyPoolInnerErrorRegistry['Signer.KeyPool.AccessKeys.NotLoaded'];
  'Signer.ExecuteTransaction.KeyPool.Empty': KeyPoolInnerErrorRegistry['Signer.KeyPool.Empty'];
  'Signer.ExecuteTransaction.KeyPool.SignService.Failed': KeyPoolInnerErrorRegistry['Signer.KeyPool.SignService.Failed'];
  'Signer.ExecuteTransaction.KeyPool.SigningKey.NotFound': KeyPoolInnerErrorRegistry['Signer.KeyPool.SigningKey.NotFound'];
  'Signer.ExecuteTransaction.TaskQueue.Timeout': TaskQueueInnerErrorRegistry['Signer.TaskQueue.Timeout'];
  'Signer.ExecuteTransaction.RecentBlockHash.NotLoaded': TaskQueueInnerErrorRegistry['Signer.RecentBlockHash.NotLoaded'];
  'Signer.ExecuteTransaction.Internal': InternalErrorContext;
}

// The intent, and everything sendSignedTransaction takes besides the signed transaction
type ExecuteTransactionArgs<
  TPS extends MaybeTransactionProcessingStage,
  RDF extends MaybeDeserializeResultDataFn,
  ASF extends MaybeDeserializeActionSummariesFn,
  ESF extends MaybeDeserializeExecutionStepsFn,
> = {
  intent: TransactionIntent;
} & TransactionSendingArgs<TPS, RDF, ASF, ESF>;

export type ExecuteTransactionError<
  TPS extends MaybeTransactionProcessingStage = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn<'Live'> = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn<'Live'> = undefined,
> =
  | NatError<'Signer.ExecuteTransaction.Args.InvalidSchema'>
  | NatError<'Signer.ExecuteTransaction.KeyPool.AccessKeys.NotLoaded'>
  | NatError<'Signer.ExecuteTransaction.KeyPool.Empty'>
  | NatError<'Signer.ExecuteTransaction.KeyPool.SignService.Failed'>
  | NatError<'Signer.ExecuteTransaction.KeyPool.SigningKey.NotFound'>
  | NatError<'Signer.ExecuteTransaction.TaskQueue.Timeout'>
  | NatError<'Signer.ExecuteTransaction.RecentBlockHash.NotLoaded'>
  // Aborted among them: it comes from the send, or from the signer itself when the call is
  // aborted before the send - then nothing was signed
  | RepackedSendSignedTransactionError<SendSignedTransactionError<TPS, ASF, ESF>>
  | NatError<'Signer.ExecuteTransaction.Internal'>;

// The deserializer type params default to `MaybeDeserialize…Fn`, as sendSignedTransaction's do,
// so an inline deserializer gets its parameter typed
export type SafeExecuteTransaction = <
  TPS extends MaybeTransactionProcessingStage = undefined,
  RDF extends MaybeDeserializeResultDataFn = MaybeDeserializeResultDataFn,
  ASF extends MaybeDeserializeActionSummariesFn = MaybeDeserializeActionSummariesFn,
  ESF extends MaybeDeserializeExecutionStepsFn = MaybeDeserializeExecutionStepsFn,
>(
  args: ExecuteTransactionArgs<TPS, RDF, ASF, ESF>,
) => Promise<
  Result<SendSignedTransactionOutput<TPS, RDF, ASF, ESF>, ExecuteTransactionError<TPS, ASF, ESF>>
>;

export type ExecuteTransaction = <
  TPS extends MaybeTransactionProcessingStage = undefined,
  RDF extends MaybeDeserializeResultDataFn = MaybeDeserializeResultDataFn,
  ASF extends MaybeDeserializeActionSummariesFn = MaybeDeserializeActionSummariesFn,
  ESF extends MaybeDeserializeExecutionStepsFn = MaybeDeserializeExecutionStepsFn,
>(
  args: ExecuteTransactionArgs<TPS, RDF, ASF, ESF>,
) => Promise<SendSignedTransactionOutput<TPS, RDF, ASF, ESF>>;

export type CreateSafeExecuteTransaction = (context: SignerContext) => SafeExecuteTransaction;
