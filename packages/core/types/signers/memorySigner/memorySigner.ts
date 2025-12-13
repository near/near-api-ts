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
  CreateStateErrorVariant,
  State,
} from 'nat-types/signers/memorySigner/state';
import type { Matcher } from 'nat-types/signers/memorySigner/matcher';
import type { TaskQueue } from 'nat-types/signers/memorySigner/taskQueue';
import type {
  CreateMemorySignerErrorVariant,
  CreateMemorySignerInternalErrorKind,
} from 'nat-types/signers/memorySigner/createMemorySigner';

export type MemorySignerErrorVariant =
  | CreateMemorySignerErrorVariant
  | CreateStateErrorVariant
  | CreateKeyPoolErrorVariant;

export type MemorySignerInternalErrorKind = CreateMemorySignerInternalErrorKind;

export type MemorySignerContext = {
  signerAccountId: AccountId;
  client: Client;
  keyService: MemoryKeyService;
  signingKeys?: PublicKey[];
  maxWaitInQueueMs: Milliseconds;
  taskQueue: TaskQueue;
  keyPool: KeyPool;
  resolver: Resolver;
  state: State;
  matcher: Matcher;
};

// NextFeature: add policies

export type MemorySigner = {
  signerAccountId: AccountId;
  // executeTransaction: ExecuteTransaction;
  // executeMultipleTransactions: ExecuteMultipleTransactions;
  // signTransaction: SignTransaction;
  // signMultipleTransactions: SignMultipleTransactions;
};
