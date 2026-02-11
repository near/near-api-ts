import type { AccountId } from '../../_common/common';
import type { Client } from '../../client/client';
import type { MemoryKeyService } from '../../keyServices/memoryKeyService/memoryKeyService';
import type {
  KeyPool,
  KeyPoolErrorVariant,
} from './keyPool';
import type { Tasker } from './tasker';
import type {
  TaskQueue,
  TaskQueueErrorVariant,
} from './taskQueue';
import type {
  CreateMemorySignerErrorVariant,
  CreateMemorySignerInternalErrorKind,
} from './createMemorySigner';
import type {
  SafeSignTransactionIntent,
  SignTransactionIntent,
  SignTransactionIntentErrorVariant,
  SignTransactionIntentInternalErrorKind,
} from './createSignTransaction';
import type {
  ExecuteTransaction,
  ExecuteTransactionErrorVariant,
  ExecuteTransactionInternalErrorKind,
  SafeExecuteTransaction,
} from './createExecuteTransaction';

export type MemorySignerErrorVariant =
  | CreateMemorySignerErrorVariant
  | KeyPoolErrorVariant
  | TaskQueueErrorVariant
  | SignTransactionIntentErrorVariant
  | ExecuteTransactionErrorVariant;

export type MemorySignerInternalErrorKind =
  | CreateMemorySignerInternalErrorKind
  | SignTransactionIntentInternalErrorKind
  | ExecuteTransactionInternalErrorKind;

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
