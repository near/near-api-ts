import type { AccountId, Milliseconds } from 'nat-types/_common/common';
import type { PublicKey } from 'nat-types/_common/crypto';
import type { Client } from 'nat-types/client/client';
import type { MemoryKeyService } from 'nat-types/keyServices/memoryKeyService/memoryKeyService';
import type {
  CreateKeyPoolErrorVariant,
  KeyPool,
} from 'nat-types/signers/memorySigner/keyPool';
import type { Resolver } from 'nat-types/signers/memorySigner/resolver';
import type {
  Matcher,
  MatcherErrorVariant,
} from 'nat-types/signers/memorySigner/matcher';
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
  | CreateKeyPoolErrorVariant
  | TaskQueueErrorVariant
  | MatcherErrorVariant
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
  signingKeys?: PublicKey[];
  maxWaitInQueueMs: Milliseconds;
  taskQueue: TaskQueue;
  keyPool: KeyPool;
  resolver: Resolver;
  matcher: Matcher;
};

// NextFeature: add policies
export type MemorySigner = {
  signerAccountId: AccountId;
  signTransaction: SignTransactionIntent;
  executeTransaction: ExecuteTransaction;
  safeSignTransaction: SafeSignTransactionIntent;
  safeExecuteTransaction: SafeExecuteTransaction;
};
