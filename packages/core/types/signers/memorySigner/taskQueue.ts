import type { MemorySignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type { UUID } from 'crypto';
import type {
  AccountId,
  ContractFunctionName,
  TimeoutId,
  Result,
  Milliseconds,
} from 'nat-types/_common/common';
import type {
  SignedTransaction,
  TransactionIntent,
} from 'nat-types/transaction';
import type {
  SendSignedTransactionError,
  SendSignedTransactionOutput,
} from 'nat-types/client/methods/transaction/sendSignedTransaction';
import type { PoolKey } from 'nat-types/signers/memorySigner/keyPool';
import type { NatError } from '@common/natError';
import type { CreateMemorySignerArgs } from 'nat-types/signers/memorySigner/createMemorySigner';

export type TaskQueueTimeout<Prefix extends string> = {
  kind: `${Prefix}.TaskQueue.Timeout`;
  context: { timeoutMs: Milliseconds };
};

export type TaskQueueErrorVariant =
  | TaskQueueTimeout<'MemorySigner'>
  | {
      kind: 'MemorySigner.Executors.ExecuteTransaction.Client.SendSignedTransaction';
      context: {
        cause: SendSignedTransactionError;
      };
    };

export type FullAccessKeyPriority = { accessType: 'FullAccess' };

export type FunctionCallKeyPriority = {
  accessType: 'FunctionCall';
  contractAccountId: AccountId;
  calledFnName: ContractFunctionName;
};

export type AccessTypePriority =
  | [FullAccessKeyPriority | FunctionCallKeyPriority]
  | [FullAccessKeyPriority, FunctionCallKeyPriority]
  | [FunctionCallKeyPriority, FullAccessKeyPriority];

export type TaskId = UUID;

type SignTransactionTask = {
  taskType: 'SignTransaction';
  taskId: TaskId;
  transactionIntent: TransactionIntent;
  accessTypePriority: AccessTypePriority;
};

type ExecuteTransactionTask = {
  taskType: 'ExecuteTransaction';
  taskId: TaskId;
  transactionIntent: TransactionIntent;
  accessTypePriority: AccessTypePriority;
};

export type Task = SignTransactionTask | ExecuteTransactionTask;

export type AddTask = (task: Task) => void;
export type RemoveTask = (taskId: TaskId) => void;

export type TaskQueueContext = {
  queue: Task[];
  cleaners: Record<TaskId, TimeoutId>;
  signerContext: MemorySignerContext;
  addTask: AddTask;
  removeTask: RemoveTask;
};

// ExecuteTransaction
type ExecuteTransactionTaskError =
  | NatError<'MemorySigner.KeyPool.AccessKeys.NotLoaded'>
  | NatError<'MemorySigner.KeyPool.Empty'>
  | NatError<'MemorySigner.KeyPool.SigningKey.NotFound'>
  | NatError<'MemorySigner.TaskQueue.Timeout'>
  | NatError<'MemorySigner.Executors.ExecuteTransaction.Client.SendSignedTransaction'>
  | NatError<'MemorySigner.ExecuteTransaction.Internal'>;

export type AddExecuteTransactionTask = (
  intent: TransactionIntent,
) => Promise<Result<SendSignedTransactionOutput, ExecuteTransactionTaskError>>;

export type CreateAddExecuteTransactionTask = (
  context: TaskQueueContext,
) => AddExecuteTransactionTask;

// SignTransaction
export type SignTransactionTaskError =
  | NatError<'MemorySigner.KeyPool.AccessKeys.NotLoaded'>
  | NatError<'MemorySigner.KeyPool.Empty'>
  | NatError<'MemorySigner.KeyPool.SigningKey.NotFound'>
  | NatError<'MemorySigner.TaskQueue.Timeout'>
  | NatError<'MemorySigner.SignTransaction.Internal'>;

export type AddSignTransactionTask = (
  intent: TransactionIntent,
) => Promise<Result<SignedTransaction, SignTransactionTaskError>>;

export type CreateAddSignTransactionTask = (
  context: TaskQueueContext,
) => AddSignTransactionTask;

export type FindTaskForKey = (key: PoolKey) => Task | undefined;

export type TaskQueue = {
  addExecuteTransactionTask: AddExecuteTransactionTask;
  addSignTransactionTask: AddSignTransactionTask;
  findTaskForKey: FindTaskForKey;
  removeTask: RemoveTask;
};

export type CreateTaskQueue = (
  signerContext: MemorySignerContext,
  createMemorySignerArgs: CreateMemorySignerArgs,
) => TaskQueue;
