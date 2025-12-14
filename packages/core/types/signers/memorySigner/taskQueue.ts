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
import type { SendSignedTransactionOutput } from 'nat-types/client/methods/transaction/sendSignedTransaction';
import type { KeyPoolKey } from 'nat-types/signers/memorySigner/keyPool';
import type { NatError } from '@common/natError';

export type TaskQueueErrorVariant = {
  kind: 'MemorySigner.TaskQueue.Task.MaxTimeInQueueReached';
  context: {
    task: Task;
    maxWaitInQueueMs: Milliseconds;
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
  | NatError<'MemorySigner.Matcher.NoKeysForTaskFound'>
  | NatError<'MemorySigner.ExecuteTransaction.Internal'>;

export type AddExecuteTransactionTask = (
  intent: TransactionIntent,
) => Promise<Result<SendSignedTransactionOutput, ExecuteTransactionTaskError>>;

export type CreateAddExecuteTransactionTask = (
  context: TaskQueueContext,
) => AddExecuteTransactionTask;

// SignTransaction
type SignTransactionTaskError =
  | NatError<'MemorySigner.Matcher.NoKeysForTaskFound'>
  | NatError<'MemorySigner.TaskQueue.Task.MaxTimeInQueueReached'>
  | NatError<'MemorySigner.SignTransaction.Internal'>;

export type AddSignTransactionTask = (
  intent: TransactionIntent,
) => Promise<Result<SignedTransaction, SignTransactionTaskError>>;

export type CreateAddSignTransactionTask = (
  context: TaskQueueContext,
) => AddSignTransactionTask;

export type FindTaskForKey = (key: KeyPoolKey) => Task | undefined;

export type TaskQueue = {
  addExecuteTransactionTask: AddExecuteTransactionTask;
  addSignTransactionTask: AddSignTransactionTask;
  findTaskForKey: FindTaskForKey;
  removeTask: RemoveTask;
};

// TODO Add later

// type ExecuteMultipleTransactionsResult = (
//   | { status: 'Success'; result: SendSignedTransactionOutput }
//   | { status: 'Error'; error: unknown }
//   | { status: 'Canceled' }
// )[];

// type SignMultipleTransactionsResult = (
//   | { status: 'Success'; result: Result<SignedTransaction, unknown> }
//   | { status: 'Error'; error: unknown }
//   | { status: 'Canceled' }
// )[];

// export type ExecuteMultipleTransactions = (args: {
//   transactionIntents: TransactionIntent[];
// }) => Promise<ExecuteMultipleTransactionsResult>;

// export type SignMultipleTransactions = (args: {
//   transactionIntents: TransactionIntent[];
// }) => Promise<SignMultipleTransactionsResult>;
