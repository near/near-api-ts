import type { NatError } from '../../src/_common/_common/_common/_common/natError';
import type { AccountId, Milliseconds, Result } from '../_common/common';
import type { PublicKey } from '../_common/crypto';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../_common/natError';
import type { SignService } from '../_common/signService';
import type { Signer } from './signer';
import type { SignerClient } from './signerClient';

export interface CreateSignerPublicErrorRegistry {
  'CreateSigner.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateSigner.Internal': InternalErrorContext;
}

export type CreateSignerArgs<
  S extends SignService = SignService,
  C extends SignerClient = SignerClient,
> = {
  signerAccountId: AccountId;
  client: C;
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

export type SafeCreateSigner = <S extends SignService, C extends SignerClient>(
  args: CreateSignerArgs<S, C>,
) => Result<Signer<S, C>, CreateSignerError>;

export type CreateSigner = <S extends SignService, C extends SignerClient>(
  args: CreateSignerArgs<S, C>,
) => Signer<S, C>;
