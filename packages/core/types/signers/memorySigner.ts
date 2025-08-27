import type { AccountId } from 'nat-types/common';
import type { PublicKey } from 'nat-types/crypto';
import type { Client } from 'nat-types/client/client';
import type { MemoryKeyService } from 'nat-types/keyServices/memoryKeyService';

export type MemorySigner = {};

type CreateMemorySignerArgs = {
  signerAccountId: AccountId;
  client: Client;
  keyService: MemoryKeyService;
  keyPool?: {
    signingKeys?: PublicKey[];
  };
  queue?: {
    taskTtlMs?: number;
  };
};

export type SignerContext = {
  signerAccountId: AccountId;
  client: Client;
  keyService: MemoryKeyService;
  signingKeys?: PublicKey[];
  taskTtlMs?: number;
};

export type CreateMemorySigner = (
  args: CreateMemorySignerArgs,
) => Promise<MemorySigner>;
