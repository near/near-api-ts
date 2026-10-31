import type { NatError } from '../../../src/_common/_common/_common/_common/natError';
import type { Result } from '../../_common/common';
import type {
  ContextFor,
  InternalErrorContext,
  InvalidSchemaErrorContext,
} from '../../_common/natError';
import type { TransactionIntent } from '../../_common/transaction/transaction';
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
  // executeTransaction validates its own args and has its own Internal
  | 'Client.SendSignedTransaction.Args.InvalidSchema'
  | 'Client.SendSignedTransaction.Internal'
  // The sign service signs with the very key the transaction names
  | 'Client.SendSignedTransaction.Rpc.Signature.Invalid'
  // executeTransaction takes no signal and no deserializers yet; these come back once it takes
  // every arg sendSignedTransaction does
  | 'Client.SendSignedTransaction.Aborted'
  | 'Client.SendSignedTransaction.DeserializeResultData.Failed'
  | 'Client.SendSignedTransaction.DeserializeActionSummaries.Failed'
  | 'Client.SendSignedTransaction.DeserializeExecutionSteps.Failed';

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

// A sendSignedTransaction error under the signer's prefix, with its whole context
type RepackedSendSignedTransactionError<E> =
  E extends NatError<infer K, infer C>
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
  'Signer.ExecuteTransaction.Internal': InternalErrorContext;
}

type ExecuteTransactionArgs = {
  intent: TransactionIntent;
};

export type ExecuteTransactionError =
  | NatError<'Signer.ExecuteTransaction.Args.InvalidSchema'>
  | NatError<'Signer.ExecuteTransaction.KeyPool.AccessKeys.NotLoaded'>
  | NatError<'Signer.ExecuteTransaction.KeyPool.Empty'>
  | NatError<'Signer.ExecuteTransaction.KeyPool.SignService.Failed'>
  | NatError<'Signer.ExecuteTransaction.KeyPool.SigningKey.NotFound'>
  | NatError<'Signer.ExecuteTransaction.TaskQueue.Timeout'>
  // The signer sends at the default processing stage and without deserializers
  | RepackedSendSignedTransactionError<SendSignedTransactionError>
  | NatError<'Signer.ExecuteTransaction.Internal'>;

export type SafeExecuteTransaction = (
  args: ExecuteTransactionArgs,
) => Promise<Result<SendSignedTransactionOutput, ExecuteTransactionError>>;

export type ExecuteTransaction = (
  args: ExecuteTransactionArgs,
) => Promise<SendSignedTransactionOutput>;

export type CreateSafeExecuteTransaction = (context: SignerContext) => SafeExecuteTransaction;
