import type { KeyPair } from '@universal/types/_common/keyPair/keyPair';
import type { PublicKey } from '@universal/types/_common/crypto';
import type { NatError } from '@universal/src/_common/natError';
import type { Result } from '@universal/types/_common/common';

type FindKeyPairArgs = { publicKey: PublicKey };

type FindKeyPairError =
  | NatError<'MemoryKeyService.FindKeyPair.Args.InvalidSchema'>
  | NatError<'MemoryKeyService.FindKeyPair.NotFound'>
  | NatError<'MemoryKeyService.FindKeyPair.Internal'>;

export type SafeFindKeyPair = (
  args: FindKeyPairArgs,
) => Result<KeyPair, FindKeyPairError>;

export type FindKeyPair = (args: FindKeyPairArgs) => KeyPair;
