import type { NatError } from '../../src/_common/natError';
import type { Result } from './common';
import type { PublicKey, Signature } from './crypto';
import type { InternalErrorContext, InvalidSchemaErrorContext } from './natError';

export interface VerifySignaturePublicErrorRegistry {
  'VerifySignature.Args.InvalidSchema': InvalidSchemaErrorContext;
  'VerifySignature.Internal': InternalErrorContext;
}

export type VerifySignatureArgs = {
  publicKey: PublicKey;
  message: Uint8Array;
  signature: Signature;
};

type VerifySignatureOutput = boolean;

type VerifySignatureError =
  | NatError<'VerifySignature.Args.InvalidSchema'>
  | NatError<'VerifySignature.Internal'>;

export type SafeVerifySignature = (
  args: VerifySignatureArgs,
) => Result<VerifySignatureOutput, VerifySignatureError>;

export type VerifySignature = (args: VerifySignatureArgs) => VerifySignatureOutput;
