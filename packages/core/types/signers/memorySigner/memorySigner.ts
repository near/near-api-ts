import type { AccountId, Milliseconds } from 'nat-types/common';
import type { PublicKey } from 'nat-types/crypto';
import type { Client } from 'nat-types/client/client';
import type { MemoryKeyService } from 'nat-types/keyServices/memoryKeyService';
import type { KeyPool } from 'nat-types/signers/memorySigner/keyPool';
import type { Resolver } from 'nat-types/signers/memorySigner/resolver';
import type { State } from 'nat-types/signers/memorySigner/state';
import type { Matcher } from 'nat-types/signers/memorySigner/matcher';
import type {
  ExecuteMultipleTransactions,
  ExecuteTransaction,
  SignMultipleTransactions,
  SignTransaction,
  TaskQueue,
} from 'nat-types/signers/memorySigner/taskQueue';

// TODO add policies
export type MemorySigner = {
  signerAccountId: AccountId;
  // executeTransaction: ExecuteTransaction;
  // executeMultipleTransactions: ExecuteMultipleTransactions;
  // signTransaction: SignTransaction;
  // signMultipleTransactions: SignMultipleTransactions;
};

type CreateMemorySignerArgs = {
  signerAccountId: AccountId;
  client: Client;
  keyService: MemoryKeyService;
  keyPool?: {
    signingKeys?: PublicKey[];
  };
  queue?: {
    taskTtlMs?: Milliseconds;
  };
};

export type SignerContext = {
  signerAccountId: AccountId;
  client: Client;
  keyService: MemoryKeyService;
  signingKeys?: PublicKey[];
  taskTtlMs?: Milliseconds;
  taskQueue: TaskQueue;
  keyPool: KeyPool;
  resolver: Resolver;
  state: State;
  matcher: Matcher;
};

export type CreateMemorySigner = (
  args: CreateMemorySignerArgs,
) => Promise<MemorySigner>;
