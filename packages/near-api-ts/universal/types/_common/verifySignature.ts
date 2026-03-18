import type { PublicKey, Signature } from '@universal/types/_common/crypto';
import type { InvalidSchemaErrorContext, InternalErrorContext } from '@universal/types/_common/natError';
import type { Result } from '@universal/types/_common/common';
import type { NatError } from '@universal/src/_common/natError';

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
