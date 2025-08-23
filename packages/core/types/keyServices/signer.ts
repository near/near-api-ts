import type { AccountId } from 'nat-types/common';
import type { PublicKey } from 'nat-types/crypto';
import type { Client } from 'nat-types/client/client';

export type MemorySigner = {};

type Input = {
  signerAccountId: AccountId;
  signerPublicKey?: PublicKey;
  client: Client;
};

export type SignerContext = {
  signerAccountId: AccountId;
  signerPublicKey?: PublicKey;
  client: Client;
}

export type CreateSigner = (input: Input) => Promise<MemorySigner>;
