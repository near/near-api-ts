import type { AccountId } from '../../_common/common';
import type { Client } from '../../client/client';
import type { MemoryKeyService } from '../../keyServices/memoryKeyService/memoryKeyService';
import type { KeyPool, KeyPoolInnerErrorRegistry } from './inner/keyPool';
import type { Tasker } from './inner/tasker';
import type { TaskQueue, TaskQueueInnerErrorRegistry } from './inner/taskQueue';
import type {
  SafeSignTransactionIntent,
  SignTransactionIntent,
  SignTransactionPublicErrorRegistry,
} from './public/createSignTransaction';
import type {
  ExecuteTransaction,
  ExecuteTransactionPublicErrorRegistry,
  SafeExecuteTransaction,
} from './public/createExecuteTransaction';
import type { CreateMemorySignerPublicErrorRegistry } from '@universal/types/signers/memorySigner/public/createMemorySigner';

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
  keyService: MemoryKeyService;
  taskQueue: TaskQueue;
  keyPool: KeyPool;
  tasker: Tasker;
};

// NextFeature: add policies
export type MemorySigner = {
  signerAccountId: AccountId;
  client: Client;
  keyService: MemoryKeyService;
  signTransaction: SignTransactionIntent;
  executeTransaction: ExecuteTransaction;
  safeSignTransaction: SafeSignTransactionIntent;
  safeExecuteTransaction: SafeExecuteTransaction;
};
