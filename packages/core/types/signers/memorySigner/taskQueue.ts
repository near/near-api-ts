import type { SignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type { UUID } from 'crypto';
import type {
  AccountId,
  ContractFunctionName,
  TimeoutId,
  Result,
} from 'nat-types/common';
import type { TransactionIntent } from 'nat-types/transaction';
import type { SendSignedTransactionResult } from 'nat-types/client/methods/transaction/sendSignedTransaction';
import type { SignedTransaction } from 'nat-types/signedTransaction';
import type { KeyPoolKey } from 'nat-types/signers/memorySigner/keyPool';

export type FullAccessKeyPriority = { accessType: 'FullAccess' };

export type FunctionCallKeyPriority = {
  accessType: 'FunctionCall';
  contractAccountId: AccountId;
  calledFnName: ContractFunctionName;
};

export type SigningKeyPriority =
  | [FullAccessKeyPriority | FunctionCallKeyPriority]
  | [FullAccessKeyPriority, FunctionCallKeyPriority]
  | [FunctionCallKeyPriority, FullAccessKeyPriority];

export type TaskId = UUID;

type TaskBase = {
  taskId: TaskId;
  transactionIntent: TransactionIntent;
  signingKeyPriority: SigningKeyPriority;
};

type SignTransactionTask = {
  taskType: 'SignTransaction';
} & TaskBase;

type ExecuteTransactionTask = {
  taskType: 'ExecuteTransaction';
} & TaskBase;

export type Task = SignTransactionTask | ExecuteTransactionTask;

export type AddTask = (task: Task) => void;
export type RemoveTask = (taskId: TaskId) => void;

export type TaskQueueContext = {
  queue: Task[];
  cleaners: Record<TaskId, TimeoutId>;
  signerContext: SignerContext;
  addTask: AddTask;
  removeTask: RemoveTask;
};

type ExecuteMultipleTransactionsResult = (
  | { status: 'Success'; result: SendSignedTransactionResult }
  | { status: 'Error'; error: unknown }
  | { status: 'Canceled' }
)[];

type SignMultipleTransactionsResult = (
  | { status: 'Success'; result: Result<SignedTransaction, unknown> }  // TODO Fix error type
  | { status: 'Error'; error: unknown } // TODO Fix error type
  | { status: 'Canceled' }
)[];

export type ExecuteTransaction = (
  args: TransactionIntent,
) => Promise<Result<SendSignedTransactionResult, unknown>>;

export type ExecuteMultipleTransactions = (args: {
  transactionIntents: TransactionIntent[];
}) => Promise<ExecuteMultipleTransactionsResult>;

export type SignTransaction = (
  args: TransactionIntent,
) => Promise<Result<SignedTransaction, unknown>>;

export type SignMultipleTransactions = (args: {
  transactionIntents: TransactionIntent[];
}) => Promise<SignMultipleTransactionsResult>;

export type FindTaskForKey = (key: KeyPoolKey) => Task | undefined;

export type TaskQueue = {
  executeTransaction: ExecuteTransaction;
  executeMultipleTransactions: ExecuteMultipleTransactions;
  signTransaction: SignTransaction;
  signMultipleTransactions: SignMultipleTransactions;
  findTaskForKey: FindTaskForKey;
  removeTask: RemoveTask;
};
