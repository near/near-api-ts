import type { UUID } from 'crypto';
import type { NatError } from '../../../src/_common/_common/_common/_common/natError';
import type { AccountId, ContractFunctionName, Milliseconds, Result } from '../../_common/common';
import type { SignTransactionOutput } from '../../_common/transaction/signTransaction';
import type { TransactionIntent } from '../../_common/transaction/transaction';
import type { MaybeTransactionProcessingStage } from '../../client/methods/transaction/_common/transactionDetails/_common/processingStage';
import type {
  MaybeDeserializeActionSummariesFn,
  MaybeDeserializeExecutionStepsFn,
  MaybeDeserializeResultDataFn,
  TransactionSendingArgs,
} from '../../client/methods/transaction/sendSignedTransaction/args';
import type { SendSignedTransactionError } from '../../client/methods/transaction/sendSignedTransaction/error';
import type { SendSignedTransactionOutput } from '../../client/methods/transaction/sendSignedTransaction/output';
import type { AbortedErrorContext } from '../../client/transport/sendRequest';
import type { CreateSignerArgs } from '../createSigner';
import type { SignerContext } from '../signer';
import type { PoolKey } from './keyPool';

export interface TaskQueueInnerErrorRegistry {
  'Signer.TaskQueue.Timeout': { timeoutMs: Milliseconds };
  // The call was aborted before its transaction was sent, and nothing was signed - an aborted
  // send has the same context
  'Signer.Aborted': AbortedErrorContext;
  // The client didn't give a recent block hash, so the transaction was neither signed nor sent
  'Signer.RecentBlockHash.NotLoaded': {
    cause:
      | NatError<'Client.GetRecentBlockHash.PreferredRpc.NotFound'>
      | NatError<'Client.GetRecentBlockHash.Timeout'>
      | NatError<'Client.GetRecentBlockHash.Exhausted'>;
  };
  'Signer.Executors.ExecuteTransaction.Client.SendSignedTransaction': {
    cause: SendSignedTransactionError;
  };
}

export type FullAccessKeyPriority = { accessType: 'FullAccess' };

export type ContractFunctionCallKeyPriority = {
  accessType: 'ContractFunctionCall';
  contractAccountId: AccountId;
  calledFnName: ContractFunctionName;
};

export type AccessTypePriority =
  | [FullAccessKeyPriority | ContractFunctionCallKeyPriority]
  | [FullAccessKeyPriority, ContractFunctionCallKeyPriority]
  | [ContractFunctionCallKeyPriority, FullAccessKeyPriority];

export type TaskId = UUID;

export type SignTransactionTask = {
  taskType: 'SignTransaction';
  taskId: TaskId;
  transactionIntent: TransactionIntent;
  accessTypePriority: AccessTypePriority;
};

// What executeTransaction takes besides the intent - its task sends the transaction with it,
// and gets the details at that stage, deserialized by those deserializers
export type ExecuteTransactionSendingArgs = TransactionSendingArgs<
  MaybeTransactionProcessingStage,
  MaybeDeserializeResultDataFn,
  MaybeDeserializeActionSummariesFn,
  MaybeDeserializeExecutionStepsFn
>;

export type ExecuteTransactionTaskOutput = SendSignedTransactionOutput<
  MaybeTransactionProcessingStage,
  MaybeDeserializeResultDataFn,
  MaybeDeserializeActionSummariesFn,
  MaybeDeserializeExecutionStepsFn
>;

export type ExecuteTransactionTask = {
  taskType: 'ExecuteTransaction';
  taskId: TaskId;
  transactionIntent: TransactionIntent;
  accessTypePriority: AccessTypePriority;
  sendingArgs: ExecuteTransactionSendingArgs;
};

export type Task = SignTransactionTask | ExecuteTransactionTask;

// A task leaves the queue once: when it starts, times out or its call is aborted. Whichever comes
// first takes it - the others find it gone
export type RemoveTask = (taskId: TaskId) => boolean;

export type TaskQueueContext = {
  queue: Task[];
  // Stops what would take a queued task out unstarted - its timeout and its signal
  cleaners: Record<TaskId, () => void>;
  signerContext: SignerContext;
  timeoutMs: Milliseconds;
};

// ExecuteTransaction
// TODO Add `Inner` prefix
type ExecuteTransactionTaskError =
  | NatError<'Signer.KeyPool.AccessKeys.NotLoaded'>
  | NatError<'Signer.KeyPool.Empty'>
  | NatError<'Signer.KeyPool.SignService.Failed'>
  | NatError<'Signer.KeyPool.SigningKey.NotFound'>
  | NatError<'Signer.TaskQueue.Timeout'>
  | NatError<'Signer.Aborted'>
  | NatError<'Signer.RecentBlockHash.NotLoaded'>
  | NatError<'Signer.Executors.ExecuteTransaction.Client.SendSignedTransaction'>
  | NatError<'Signer.ExecuteTransaction.Internal'>;

type AddExecuteTransactionTaskArgs = {
  transactionIntent: TransactionIntent;
  sendingArgs: ExecuteTransactionSendingArgs;
};

export type AddExecuteTransactionTask = (
  args: AddExecuteTransactionTaskArgs,
) => Promise<Result<ExecuteTransactionTaskOutput, ExecuteTransactionTaskError>>;

export type CreateAddExecuteTransactionTask = (
  context: TaskQueueContext,
) => AddExecuteTransactionTask;

// SignTransaction
export type SignTransactionTaskError =
  | NatError<'Signer.KeyPool.AccessKeys.NotLoaded'>
  | NatError<'Signer.KeyPool.Empty'>
  | NatError<'Signer.KeyPool.SignService.Failed'>
  | NatError<'Signer.KeyPool.SigningKey.NotFound'>
  | NatError<'Signer.TaskQueue.Timeout'>
  | NatError<'Signer.RecentBlockHash.NotLoaded'>
  | NatError<'Signer.SignTransaction.Internal'>;

export type AddSignTransactionTask = (
  intent: TransactionIntent,
) => Promise<Result<SignTransactionOutput, SignTransactionTaskError>>;

export type CreateAddSignTransactionTask = (context: TaskQueueContext) => AddSignTransactionTask;

export type FindTaskForKey = (key: PoolKey) => Task | undefined;

export type TaskQueue = {
  addExecuteTransactionTask: AddExecuteTransactionTask;
  addSignTransactionTask: AddSignTransactionTask;
  findTaskForKey: FindTaskForKey;
  removeTask: RemoveTask;
};

export type CreateTaskQueue = (
  signerContext: SignerContext,
  createSignerArgs: CreateSignerArgs,
) => TaskQueue;
