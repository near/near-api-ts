import type { AccountId } from 'nat-types/common';
import type { PublicKey } from 'nat-types/crypto';
import type { Client } from 'nat-types/client/client';

export type MemorySigner = {};

type Input = {
  signerAccountId: AccountId;
  client: Client;
  options?: {
    signerPublicKey?: PublicKey;
    queueTimeout?: number;
  };
};

export type SignerContext = {
  signerAccountId: AccountId;
  client: Client;
  signerPublicKey?: PublicKey;
  queueTimeout?: number;
};

export type CreateSigner = (input: Input) => Promise<MemorySigner>;
