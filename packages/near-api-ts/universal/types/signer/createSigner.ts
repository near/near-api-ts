import type { NatError } from '../../src/_common/_common/_common/_common/natError';
import type { AccountId, Milliseconds, Result } from '../_common/common';
import type { PublicKey } from '../_common/crypto';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../_common/natError';
import type { SignService } from '../_common/signService';
import type { Client } from '../client/client';
import type { Signer } from './signer';

export interface CreateSignerPublicErrorRegistry {
  'CreateSigner.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateSigner.Internal': InternalErrorContext;
}

export type CreateSignerArgs<S extends SignService = SignService> = {
  signerAccountId: AccountId;
  client: Client;
  signService: S;
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

export type SafeCreateSigner = <S extends SignService>(
  args: CreateSignerArgs<S>,
) => Result<Signer<S>, CreateSignerError>;

export type CreateSigner = <S extends SignService>(args: CreateSignerArgs<S>) => Signer<S>;
