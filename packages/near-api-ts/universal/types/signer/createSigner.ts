import type { NatError } from '../../src/_common/_common/_common/_common/natError';
import type { AccountId, Milliseconds, Result } from '../_common/common';
import type { PublicKey } from '../_common/crypto';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../_common/natError';
import type { Client } from '../client/client';
import type { MemoryVault } from '../memoryVault/memoryVault';
import type { Signer } from './signer';

export interface CreateSignerPublicErrorRegistry {
  'CreateSigner.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateSigner.Internal': InternalErrorContext;
}

export type CreateSignerArgs = {
  signerAccountId: AccountId;
  client: Client;
  keyVault: MemoryVault;
  keyPool?: {
    allowedAccessKeys?: PublicKey[];
  };
  taskQueue?: {
    timeoutMs?: Milliseconds;
  };
};

type CreateSignerError =
  | NatError<'CreateSigner.Args.InvalidSchema'>
  | NatError<'CreateSigner.Internal'>;

export type SafeCreateSigner = (args: CreateSignerArgs) => Result<Signer, CreateSignerError>;

export type CreateSigner = (args: CreateSignerArgs) => Signer;
