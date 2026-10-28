import type { AccountId } from '../_common/common';
import type { Client } from '../client/client';
import type { MemoryVault } from '../memoryVault/memoryVault';
import type { CreateSignerPublicErrorRegistry } from './createSigner';
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

export interface SignerInnerErrorRegistry
  extends KeyPoolInnerErrorRegistry,
    TaskQueueInnerErrorRegistry {}

export interface SignerPublicErrorRegistry
  extends CreateSignerPublicErrorRegistry,
    ExecuteTransactionPublicErrorRegistry,
    SignTransactionPublicErrorRegistry {}

export type SignerContext = {
  signerAccountId: AccountId;
  client: Client;
  keyVault: MemoryVault;
  taskQueue: TaskQueue;
  keyPool: KeyPool;
  tasker: Tasker;
};

// NextFeature: add policies
export type Signer = {
  signerAccountId: AccountId;
  client: Client;
  keyVault: MemoryVault;
  signTransaction: SignTransactionIntent; // TODO remove Intent from public type
  executeTransaction: ExecuteTransaction;
  safeSignTransaction: SafeSignTransactionIntent;
  safeExecuteTransaction: SafeExecuteTransaction;
};
