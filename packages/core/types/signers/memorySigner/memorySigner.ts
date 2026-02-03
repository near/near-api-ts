import type { AccountId } from 'nat-types/_common/common';
import type { Client } from 'nat-types/client/client';
import type { MemoryKeyService } from 'nat-types/keyServices/memoryKeyService/memoryKeyService';
import type {
  KeyPool,
  KeyPoolErrorVariant,
} from 'nat-types/signers/memorySigner/keyPool';
import type { Resolver } from 'nat-types/signers/memorySigner/resolver';
import type { Matcher } from 'nat-types/signers/memorySigner/matcher';
import type {
  TaskQueue,
  TaskQueueErrorVariant,
} from 'nat-types/signers/memorySigner/taskQueue';
import type {
  CreateMemorySignerErrorVariant,
  CreateMemorySignerInternalErrorKind,
} from 'nat-types/signers/memorySigner/createMemorySigner';
import type {
  SafeSignTransactionIntent,
  SignTransactionIntent,
  SignTransactionIntentErrorVariant,
  SignTransactionIntentInternalErrorKind,
} from 'nat-types/signers/memorySigner/createSignTransaction';
import type {
  ExecuteTransaction,
  ExecuteTransactionErrorVariant,
  ExecuteTransactionInternalErrorKind,
  SafeExecuteTransaction,
} from 'nat-types/signers/memorySigner/createExecuteTransaction';

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
  resolver: Resolver;
  matcher: Matcher;
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
