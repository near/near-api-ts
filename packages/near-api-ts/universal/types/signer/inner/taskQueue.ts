import type { UUID } from 'crypto';
import type { NatError } from '../../../src/_common/_common/_common/_common/natError';
import type {
  AccountId,
  ContractFunctionName,
  Milliseconds,
  Result,
  TimeoutId,
} from '../../_common/common';
import type { SignTransactionOutput } from '../../_common/transaction/signTransaction';
import type { TransactionIntent } from '../../_common/transaction/transaction';
import type { SendSignedTransactionError } from '../../client/methods/transaction/sendSignedTransaction/error';
import type { SendSignedTransactionOutput } from '../../client/methods/transaction/sendSignedTransaction/output';
import type { CreateSignerArgs } from '../createSigner';
import type { SignerContext } from '../signer';
import type { PoolKey } from './keyPool';

export interface TaskQueueInnerErrorRegistry {
  'Signer.TaskQueue.Timeout': { timeoutMs: Milliseconds };
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

export type RemoveTask = (taskId: TaskId) => void;

export type TaskQueueContext = {
  queue: Task[];
  cleaners: Record<TaskId, TimeoutId>;
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
  | NatError<'Signer.RecentBlockHash.NotLoaded'>
  | NatError<'Signer.Executors.ExecuteTransaction.Client.SendSignedTransaction'>
  | NatError<'Signer.ExecuteTransaction.Internal'>;

export type AddExecuteTransactionTask = (
  intent: TransactionIntent,
) => Promise<Result<SendSignedTransactionOutput<any, any, any, any>, ExecuteTransactionTaskError>>;

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
