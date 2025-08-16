import type { AccountId } from 'nat-types/common';
import type { PublicKey } from 'nat-types/crypto';
import type { Client } from '../../src/client/createClient/createClient';

export type MemorySigner = {};

type CreateSignerInput = {
  signerAccountId: AccountId;
  signerPublicKey?: PublicKey;
  client: Client;
  options?: {
    signStrategy?: {
      keyPriority: 'FullAccess' | 'FunctionCall'; // todo no need
    };
  };
};

export type CreateSigner = (params: CreateSignerInput) => Promise<MemorySigner>;
