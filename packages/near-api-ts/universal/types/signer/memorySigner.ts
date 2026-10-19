import type { AccountId } from '../_common/common';
import type { Client } from '../client/client';
import type { MemoryKeyVault } from '../memoryKeyVault/memoryKeyVault';
import type { CreateMemorySignerPublicErrorRegistry } from './createMemorySigner';
import type { KeyPool, KeyPoolInnerErrorRegistry } from './inner/keyPool';
import type { Tasker } from './inner/tasker';
import type { TaskQueue, TaskQueueInnerErrorRegistry } from './inner/taskQueue';
import type {
  ExecuteTransaction,
  ExecuteTransactionPublicErrorRegistry,
  SafeExecuteTransaction,
} from './public/createExecuteTransaction';
import type {
  SafeSignTransactionIntent,
  SignTransactionIntent,
  SignTransactionPublicErrorRegistry,
} from './public/createSignTransaction';

export interface MemorySignerInnerErrorRegistry
  extends KeyPoolInnerErrorRegistry,
    TaskQueueInnerErrorRegistry {}

export interface MemorySignerPublicErrorRegistry
  extends CreateMemorySignerPublicErrorRegistry,
    ExecuteTransactionPublicErrorRegistry,
    SignTransactionPublicErrorRegistry {}

export type MemorySignerContext = {
  signerAccountId: AccountId;
  client: Client;
  keyVault: MemoryKeyVault;
  taskQueue: TaskQueue;
  keyPool: KeyPool;
  tasker: Tasker;
};

// NextFeature: add policies
export type MemorySigner = {
  signerAccountId: AccountId;
  client: Client;
  keyVault: MemoryKeyVault;
  signTransaction: SignTransactionIntent; // TODO remove Intent from public type
  executeTransaction: ExecuteTransaction;
  safeSignTransaction: SafeSignTransactionIntent;
  safeExecuteTransaction: SafeExecuteTransaction;
};
